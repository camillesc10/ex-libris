import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

const GENRES = ["Romantasy", "Romance", "Fantasy", "SF", "Thriller", "Contemporain", "Historique", "Dystopie", "Cosy mystery"] as const;

// Mappe les catégories Google Books → nos genres
function mapCategory(categories: string[], title: string, author: string): string {
  const all = [...categories, title, author].join(" ").toLowerCase();

  if (all.includes("romantasy") || (all.includes("romance") && (all.includes("fantasy") || all.includes("magic") || all.includes("fae") || all.includes("dragon")))) return "Romantasy";
  if (all.includes("cozy mystery") || all.includes("cosy mystery") || all.includes("cozy crime")) return "Cosy mystery";
  if (all.includes("romance") || all.includes("love story") || all.includes("harlequin")) return "Romance";
  if (all.includes("dystopi")) return "Dystopie";
  if (all.includes("science fiction") || all.includes("sci-fi") || all.includes("space opera") || all.includes("cyberpunk")) return "SF";
  if (all.includes("fantasy") || all.includes("magic") || all.includes("sorcier") || all.includes("sorcière") || all.includes("fae") || all.includes("dragon") || all.includes("épique") || all.includes("epic fantasy")) return "Fantasy";
  if (all.includes("thriller") || all.includes("suspense") || all.includes("mystery") || all.includes("crime") || all.includes("policier")) return "Thriller";
  if (all.includes("histor") || all.includes("medieval") || all.includes("victorian") || all.includes("regency") || all.includes("moyen âge") || all.includes("xviiie") || all.includes("xixe")) return "Historique";
  if (all.includes("contemporain") || all.includes("contemporary") || all.includes("literary fiction")) return "Contemporain";

  return "";
}

async function fetchGenreFromGoogle(title: string, author: string): Promise<string> {
  try {
    const q = `${title} ${author}`.trim();
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1&printType=books`;
    const res = await fetch(url);
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

  const sql = neon(url);

  // Livres sans genre ou avec genre vide/par défaut
  const books = await sql`
    SELECT id, title, author
    FROM books
    WHERE genre IS NULL OR genre = '' OR genre = 'Romance'
    ORDER BY title
  `;

  const results: { id: string; title: string; genre: string; previous: string }[] = [];
  let updated = 0;

  for (const book of books) {
    const genre = await fetchGenreFromGoogle(book.title as string, book.author as string);
    if (genre && GENRES.includes(genre as typeof GENRES[number])) {
      await sql`UPDATE books SET genre = ${genre} WHERE id = ${book.id as string}`;
      results.push({ id: book.id as string, title: book.title as string, genre, previous: "" });
      updated++;
    } else {
      results.push({ id: book.id as string, title: book.title as string, genre: "(inchangé)", previous: "" });
    }
    // Pause légère pour éviter le rate-limit Google
    await new Promise((r) => setTimeout(r, 120));
  }

  return NextResponse.json({ ok: true, total: books.length, updated, results });
}
