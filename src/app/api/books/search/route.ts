import { NextRequest, NextResponse } from "next/server";

export type GoogleBookResult = {
  id: string;
  title: string;
  author: string;
  pages: number;
  cover: string | null;
  publisher: string;
  year: string;
  lang: string;
  snippet: string;
  isbn: string | null;
};

type OLDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
  language?: string[];
  isbn?: string[];
};

function mapGoogleBooks(items: unknown[]): GoogleBookResult[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (items as any[]).map((item) => {
    const info = item.volumeInfo ?? {};
    const images = info.imageLinks ?? {};
    const cover =
      (images.medium ?? images.thumbnail ?? images.smallThumbnail ?? null)
        ?.replace("http://", "https://")
        ?.replace("&edge=curl", "") ?? null;

    const ids: { type: string; identifier: string }[] = info.industryIdentifiers ?? [];
    const isbn =
      ids.find((i) => i.type === "ISBN_13")?.identifier ??
      ids.find((i) => i.type === "ISBN_10")?.identifier ??
      null;

    return {
      id: item.id,
      title: info.title ?? "",
      author: (info.authors ?? []).join(", "),
      pages: info.pageCount ?? 0,
      cover,
      publisher: info.publisher ?? "",
      year: info.publishedDate?.slice(0, 4) ?? "",
      lang: (info.language ?? "fr").toUpperCase(),
      snippet: (info.description ?? "").slice(0, 200),
      isbn,
    };
  });
}

function mapOpenLibrary(docs: OLDoc[]): GoogleBookResult[] {
  return docs.map((d, i) => {
    const isbn = d.isbn?.[0] ?? null;
    const cover = d.cover_i
      ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
      : isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
      : null;
    const rawLang = (d.language ?? [])[0] ?? "fre";
    const lang = rawLang.slice(0, 2).toUpperCase();
    return {
      id: d.key ?? `ol${i}`,
      title: d.title ?? "",
      author: (d.author_name ?? []).join(", "),
      pages: d.number_of_pages_median ?? 0,
      cover,
      publisher: "",
      year: d.first_publish_year ? String(d.first_publish_year) : "",
      lang,
      snippet: "",
      isbn,
    };
  });
}

function isIsbn(q: string) {
  const digits = q.replace(/[-\s]/g, "");
  return /^\d{10}$/.test(digits) || /^\d{13}$/.test(digits);
}

// Open Library Books API — dedicated ISBN lookup, more reliable than search index
async function fetchOLByIsbn(isbn: string): Promise<GoogleBookResult | null> {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = await res.json();
    const key = `ISBN:${isbn}`;
    const book = data[key];
    if (!book) return null;

    const cover: string | null =
      book.cover?.large ?? book.cover?.medium ?? book.cover?.small ?? null;
    const authors: string = (book.authors ?? []).map((a: { name: string }) => a.name).join(", ");
    const year: string = book.publish_date
      ? String(book.publish_date).replace(/\D.*/, "").slice(0, 4)
      : "";
    const pages: number = book.number_of_pages ?? 0;
    const isbn13: string | null =
      book.identifiers?.isbn_13?.[0] ?? book.identifiers?.isbn_10?.[0] ?? isbn;

    return {
      id: key,
      title: book.title ?? "",
      author: authors,
      pages,
      cover,
      publisher: (book.publishers ?? []).map((p: { name: string }) => p.name).join(", "),
      year,
      lang: "FR",
      snippet: book.excerpts?.[0]?.text?.slice(0, 200) ?? "",
      isbn: isbn13,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ items: [] });

  const isbn = isIsbn(q);
  const isbnDigits = q.replace(/[-\s]/g, "");
  const googleQuery = isbn ? `isbn:${isbnDigits}` : q;

  // Try Google Books first
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=12&printType=books`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const items = mapGoogleBooks(data.items ?? []);
      if (items.length) return NextResponse.json({ items, source: "google" });
    }
  } catch {
    // fall through
  }

  // ISBN: use Open Library Books API (dedicated endpoint, not search index)
  if (isbn) {
    const book = await fetchOLByIsbn(isbnDigits);
    if (book) return NextResponse.json({ items: [book], source: "openlibrary" });
  }

  // Text search: Open Library search index
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`OL ${res.status}`);
    const data = await res.json();
    const items = mapOpenLibrary(data.docs ?? []);
    return NextResponse.json({ items, source: "openlibrary" });
  } catch (e) {
    console.error("[Books search]", e);
    return NextResponse.json({ items: [], error: String(e) });
  }
}
