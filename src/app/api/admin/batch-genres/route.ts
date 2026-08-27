import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

const GENRES = ["Romantasy", "Romance", "Fantasy", "SF", "Thriller", "Contemporain", "Historique", "Dystopie", "Cosy mystery"] as const;
type Genre = typeof GENRES[number];

// Hardcover genre names → nos genres
function mapHardcoverGenres(genres: string[], title: string, author: string): Genre | "" {
  const all = [...genres, title, author].join(" ").toLowerCase();
  const hasRomance = genres.some((g) => g.toLowerCase().includes("romance"));
  const hasFantasy = genres.some((g) => g.toLowerCase().includes("fantasy") || g.toLowerCase() === "fae" || g.toLowerCase() === "paranormal");

  if (hasRomance && hasFantasy) return "Romantasy";
  if (genres.some((g) => /cozy|cosy/i.test(g))) return "Cosy mystery";
  if (genres.some((g) => /dystopi/i.test(g))) return "Dystopie";
  if (genres.some((g) => /science fiction|sci-fi|space/i.test(g))) return "SF";
  if (hasFantasy) return "Fantasy";
  if (genres.some((g) => /thriller|suspense/i.test(g))) return "Thriller";
  if (genres.some((g) => /histor/i.test(g))) return "Historique";
  if (genres.some((g) => /contemporary/i.test(g))) return "Contemporain";
  if (genres.some((g) => /mystery|crime/i.test(g))) return "Thriller";
  if (hasRomance) return "Romance";

  // Fallback : lecture des mots dans title/author
  if (all.includes("romantasy")) return "Romantasy";
  if (all.includes("fantasy") || all.includes("magie") || all.includes("fae")) return "Fantasy";
  if (all.includes("romance") || all.includes("amour")) return "Romance";

  return "";
}

// Mappe les catégories Google Books → nos genres (fallback)
function mapGoogleCategories(categories: string[], description: string, title: string, author: string): Genre | "" {
  const all = [...categories, description, title, author].join(" ").toLowerCase();
  const hasRomance = all.includes("romance") || all.includes("love story");
  const hasFantasy = all.includes("fantasy") || all.includes("magic") || all.includes("fae") || all.includes("dragon");

  if (hasRomance && hasFantasy) return "Romantasy";
  if (all.includes("cozy mystery") || all.includes("cosy mystery")) return "Cosy mystery";
  if (all.includes("dystopi")) return "Dystopie";
  if (all.includes("science fiction") || all.includes("sci-fi") || all.includes("space opera")) return "SF";
  if (hasFantasy) return "Fantasy";
  if (all.includes("thriller") || all.includes("suspense") || all.includes("crime")) return "Thriller";
  if (all.includes("histor") || all.includes("victorian") || all.includes("regency") || all.includes("medieval")) return "Historique";
  if (all.includes("contemporary")) return "Contemporain";
  if (all.includes("mystery")) return "Thriller";
  if (hasRomance) return "Romance";
  return "";
}

async function hcPost(query: string, variables: Record<string, unknown>) {
  const apiKey = process.env.HARDCOVER_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchGenreFromHardcover(title: string, author: string): Promise<Genre | ""> {
  // Les genres sont déjà dans le document de recherche (string[])
  // On demande 5 hits pour pouvoir filtrer par auteur (le premier peut être un guide/compagnon)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchData: any = await hcPost(
    `query($q: String!) { search(query: $q, query_type: "Book", per_page: 5) { results } }`,
    { q: `${title} ${author}` }
  );
  const hits: unknown[] = searchData?.data?.search?.results?.hits ?? [];
  if (!hits.length) return "";

  // Préférer le hit dont l'auteur correspond
  const normAuthor = author.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const best = hits.find((h: any) =>
    (h.document?.author_names as string[] ?? []).some(
      (a: string) => a.toLowerCase().replace(/[^a-z]/g, "").includes(normAuthor)
    )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any ?? (hits[0] as any);

  const genres: string[] = best?.document?.genres ?? [];
  return mapHardcoverGenres(genres, title, author);
}

async function fetchGenreFromGoogle(title: string, author: string): Promise<Genre | ""> {
  try {
    const q = `${title} ${author}`.trim();
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1&printType=books`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return "";
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return "";
    const categories: string[] = item.volumeInfo?.categories ?? [];
    const description: string = item.volumeInfo?.description ?? "";
    return mapGoogleCategories(categories, description, title, author);
  } catch {
    return "";
  }
}

async function fetchGenre(title: string, author: string): Promise<{ genre: Genre | ""; source: string }> {
  const hc = await fetchGenreFromHardcover(title, author);
  if (hc) return { genre: hc, source: "hardcover" };
  const google = await fetchGenreFromGoogle(title, author);
  if (google) return { genre: google, source: "google" };
  return { genre: "", source: "—" };
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
      `query($q: String!) { search(query: $q, query_type: "Book", per_page: 3) { results } }`,
      { q: `${title} ${author}` }
    );
    const hits = searchRaw?.data?.search?.results?.hits ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary = hits.map((h: any) => ({
      title: h.document?.title,
      authors: h.document?.author_names,
      genres: h.document?.genres,
      moods: h.document?.moods,
      tags: h.document?.tags,
    }));
    // Trouver l'id du bon hit
    const normAuthor = author.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const best = hits.find((h: any) =>
      (h.document?.author_names as string[] ?? []).some(
        (a: string) => a.toLowerCase().replace(/[^a-z]/g, "").includes(normAuthor)
      )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any ?? (hits[0] as any);
    const bookId = parseInt(best?.document?.id ?? "0");
    // Tester plusieurs structures de champs pour les genres
    const attempts = await Promise.all([
      hcPost(`query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { book_genre { genre { name } } } }`, { id: bookId }),
      hcPost(`query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { taggings { tag { name } } } }`, { id: bookId }),
      hcPost(`query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { cached_tags } }`, { id: bookId }),
      hcPost(`query($id: Int!) { book_genre(where:{book_id:{_eq:$id}}) { genre { name } } }`, { id: bookId }),
      hcPost(`query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { genre } }`, { id: bookId }),
    ]);
    return NextResponse.json({ summary, bookId, attempts });
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

  const results: { title: string; genre: string; source: string }[] = [];
  let updated = 0;

  for (const book of books) {
    const { genre, source } = await fetchGenre(book.title as string, book.author as string);
    if (genre) {
      await sql`UPDATE books SET genre = ${genre} WHERE id = ${book.id as string}`;
      results.push({ title: book.title as string, genre, source });
      updated++;
    } else {
      results.push({ title: book.title as string, genre: "?", source });
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
