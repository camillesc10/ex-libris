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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ items: [] });

  const isbn = isIsbn(q);
  const googleQuery = isbn ? `isbn:${q.replace(/[-\s]/g, "")}` : q;

  // Try Google Books first
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=12&printType=books`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const items = mapGoogleBooks(data.items ?? []);
      if (items.length) return NextResponse.json({ items, source: "google" });
    }
    // 429 or empty — fall through to Open Library
  } catch {
    // network error — fall through
  }

  // Fallback: Open Library
  try {
    const olParams = isbn
      ? `isbn=${encodeURIComponent(q.replace(/[-\s]/g, ""))}&limit=12`
      : `q=${encodeURIComponent(q)}&limit=12`;
    const url = `https://openlibrary.org/search.json?${olParams}`;
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
