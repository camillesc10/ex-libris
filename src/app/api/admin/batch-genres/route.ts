import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

async function hcPost(query: string, variables: Record<string, unknown>) {
  const apiKey = process.env.HARDCOVER_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function fetchGenresFromHardcover(title: string, author: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchData: any = await hcPost(
    `query($q: String!) { search(query: $q, query_type: "Book", per_page: 5) { results } }`,
    { q: `${title} ${author}` }
  );
  const hits: unknown[] = searchData?.data?.search?.results?.hits ?? [];
  if (!hits.length) return [];

  const normTitle = norm(title).slice(0, 12);
  const normAuthor = norm(author).slice(0, 8);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchTitleAuthor = (h: any) =>
    norm(h.document?.title ?? "").includes(normTitle) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (h.document?.author_names as string[] ?? []).some((a: string) => norm(a).includes(normAuthor));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchAuthor = (h: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (h.document?.author_names as string[] ?? []).some((a: string) => norm(a).includes(normAuthor));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const best: any = hits.find(matchTitleAuthor) ?? hits.find(matchAuthor) ?? hits[0];

  const bookId = parseInt(best?.document?.id ?? "0");

  // cached_tags donne la liste complète des genres votés par la communauté
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagData: any = await hcPost(
    `query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { cached_tags } }`,
    { id: bookId }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const genreTags: string[] = (tagData?.data?.books?.[0]?.cached_tags?.Genre ?? []).map((g: any) => g.tag as string);

  // Fallback sur les genres du document de recherche si cached_tags vide
  return genreTags.length ? genreTags : (best?.document?.genres ?? []);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

  // Mode debug : ?debug=1&title=...&author=...
  const debugMode = req.nextUrl.searchParams.get("debug") === "1";
  if (debugMode) {
    const title = req.nextUrl.searchParams.get("title") ?? "";
    const author = req.nextUrl.searchParams.get("author") ?? "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchRaw: any = await hcPost(
      `query($q: String!) { search(query: $q, query_type: "Book", per_page: 5) { results } }`,
      { q: `${title} ${author}` }
    );
    const hits = searchRaw?.data?.search?.results?.hits ?? [];
    const normT = norm(title).slice(0, 12);
    const normA = norm(author).slice(0, 8);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchTitleAuthor = (h: any) =>
      norm(h.document?.title ?? "").includes(normT) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (h.document?.author_names as string[] ?? []).some((a: string) => norm(a).includes(normA));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchAuthor = (h: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (h.document?.author_names as string[] ?? []).some((a: string) => norm(a).includes(normA));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const best: any = hits.find(matchTitleAuthor) ?? hits.find(matchAuthor) ?? hits[0];
    const bookId = best?.document?.id ? parseInt(best.document.id) : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedTags: any = null;
    if (bookId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tagData: any = await hcPost(
        `query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { cached_tags } }`,
        { id: bookId }
      );
      cachedTags = tagData?.data?.books?.[0]?.cached_tags ?? null;
    }
    const genreTags: string[] = (cachedTags?.Genre ?? []).map((g: { tag: string }) => g.tag);
    const genres = genreTags.length ? genreTags : (best?.document?.genres ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary = hits.map((h: any) => ({
      id: h.document?.id,
      title: h.document?.title,
      authors: h.document?.author_names,
      docGenres: h.document?.genres,
    }));
    return NextResponse.json({ genres, bestHit: { id: bookId, title: best?.document?.title }, genreTags, summary });
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "20"), 40);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");

  const sql = neon(dbUrl);

  const books = await sql`
    SELECT id, title, author
    FROM books
    ORDER BY title
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM books`;

  const results: { title: string; genres: string[]; source: string }[] = [];
  let updated = 0;

  for (const book of books) {
    const genres = await fetchGenresFromHardcover(book.title as string, book.author as string);
    if (genres.length) {
      await sql`UPDATE books SET genres = ${JSON.stringify(genres)}::jsonb WHERE id = ${book.id as string}`;
      results.push({ title: book.title as string, genres, source: "hardcover" });
      updated++;
    } else {
      results.push({ title: book.title as string, genres: [], source: "—" });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: books.length,
    updated,
    stillRemaining: (total as number) - offset - books.length,
    nextOffset: offset + limit,
    results,
  });
}
