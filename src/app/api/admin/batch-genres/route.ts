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
  // 1 seul appel : le document de recherche contient déjà les genres
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

  return best?.document?.genres ?? [];
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
    const genres: string[] = best?.document?.genres ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary = hits.map((h: any) => ({
      id: h.document?.id,
      title: h.document?.title,
      authors: h.document?.author_names,
      genres: h.document?.genres,
    }));
    return NextResponse.json({ genres, bestHit: { id: best?.document?.id, title: best?.document?.title }, summary });
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "8"), 12);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");

  const sql = neon(dbUrl);

  const force = req.nextUrl.searchParams.get("force") === "1";

  const books = force
    ? await sql`SELECT id, title, author FROM books ORDER BY title LIMIT ${limit} OFFSET ${offset}`
    : await sql`SELECT id, title, author FROM books WHERE genres = '[]'::jsonb OR genres IS NULL ORDER BY title LIMIT ${limit} OFFSET ${offset}`;

  const [{ total }] = force
    ? await sql`SELECT COUNT(*)::int AS total FROM books`
    : await sql`SELECT COUNT(*)::int AS total FROM books WHERE genres = '[]'::jsonb OR genres IS NULL`;

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
    // 1 req/s max (60/min) — 1 appel par livre donc 1s de pause suffit
    await new Promise((r) => setTimeout(r, 1000));
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
