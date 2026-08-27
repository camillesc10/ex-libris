import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

const GENRES = ["Romantasy", "Romance", "Fantasy", "SF", "Thriller", "Contemporain", "Historique", "Dystopie", "Cosy mystery"] as const;
type Genre = typeof GENRES[number];

function mapCategory(categories: string[], title: string, author: string): Genre | "" {
  const all = [...categories, title, author].join(" ").toLowerCase();

  if (all.includes("romantasy") || (all.includes("romance") && (all.includes("fantasy") || all.includes("magic") || all.includes("fae") || all.includes("dragon")))) return "Romantasy";
  if (all.includes("cozy mystery") || all.includes("cosy mystery") || all.includes("cozy crime")) return "Cosy mystery";
  if (all.includes("dystopi")) return "Dystopie";
  if (all.includes("science fiction") || all.includes("sci-fi") || all.includes("space opera") || all.includes("cyberpunk")) return "SF";
  if (all.includes("fantasy") || all.includes("magic") || all.includes("fae") || all.includes("dragon") || all.includes("epic fantasy")) return "Fantasy";
  if (all.includes("thriller") || all.includes("suspense") || all.includes("crime") || all.includes("policier")) return "Thriller";
  if (all.includes("histor") || all.includes("medieval") || all.includes("victorian") || all.includes("regency") || all.includes("moyen âge")) return "Historique";
  if (all.includes("contemporain") || all.includes("contemporary") || all.includes("literary fiction")) return "Contemporain";
  if (all.includes("mystery") || all.includes("cozy")) return "Cosy mystery";
  if (all.includes("romance") || all.includes("love story")) return "Romance";

  return "";
}

async function fetchGenre(title: string, author: string): Promise<Genre | ""> {
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
    return mapCategory([...categories, description], title, author);
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "25"), 50);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");

  const sql = neon(dbUrl);

  const books = await sql`
    SELECT id, title, author
    FROM books
    ORDER BY title
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [{ remaining }] = await sql`
    SELECT COUNT(*)::int AS remaining FROM books
  `;

  const results: { title: string; genre: string }[] = [];
  let updated = 0;

  for (const book of books) {
    const genre = await fetchGenre(book.title as string, book.author as string);
    if (genre) {
      await sql`UPDATE books SET genre = ${genre} WHERE id = ${book.id as string}`;
      results.push({ title: book.title as string, genre });
      updated++;
    } else {
      results.push({ title: book.title as string, genre: "?" });
    }
  }

  const total = remaining as number;
  const stillRemaining = total - offset - books.length;

  return NextResponse.json({
    ok: true,
    processed: books.length,
    updated,
    stillRemaining,
    nextOffset: offset + limit,
    results,
  });
}
