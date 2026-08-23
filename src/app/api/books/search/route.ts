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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ items: [] });

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12&printType=books`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: GoogleBookResult[] = (data.items ?? []).map((item: any) => {
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

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[Google Books]", e);
    return NextResponse.json({ items: [], error: String(e) }, { status: 500 });
  }
}
