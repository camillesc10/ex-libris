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
  releaseDate?: string;
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

// Open Library Books API — dedicated ISBN lookup
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

// ─── BnF SRU ──────────────────────────────────────────────────────────────────

function xmlGet(record: string, tag: string): string {
  const val = record.match(new RegExp(`<dc:${tag}[^>]*>([^<]*)<\\/dc:${tag}>`))?.[1]?.trim() ?? "";
  return val.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function xmlGetAll(record: string, tag: string): string[] {
  return [...record.matchAll(new RegExp(`<dc:${tag}[^>]*>([^<]*)<\\/dc:${tag}>`, "g"))]
    .map(m => m[1].trim().replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
}

async function fetchBnF(q: string, isbnQuery: boolean): Promise<GoogleBookResult[]> {
  try {
    const query = isbnQuery ? `bib.isbn adj "${q}"` : `bib.anywhere adj "${q}"`;
    const url = `https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=${encodeURIComponent(query)}&maximumRecords=12&recordSchema=dublincore`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();

    const records = xml.match(/<oai_dc:dc[\s\S]*?<\/oai_dc:dc>/g) ?? [];
    return records.map((rec, i) => {
      const title = xmlGet(rec, "title");
      const author = xmlGet(rec, "creator");
      const date = xmlGet(rec, "date").slice(0, 4);
      const publisher = xmlGet(rec, "publisher");
      const format = xmlGet(rec, "format");
      const identifiers = xmlGetAll(rec, "identifier");

      const pages = parseInt(format.match(/(\d+)\s*p/)?.[1] ?? "0") || 0;
      const rawIsbn = identifiers.find(id => /\d{9}[\dX]/i.test(id.replace(/[^0-9Xx]/g, ""))) ?? null;
      const isbn = rawIsbn ? rawIsbn.replace(/[^0-9Xx]/gi, "").replace(/x/g, "X").slice(-13) : null;

      const cover = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null;

      return {
        id: `bnf:${i}`,
        title,
        author,
        pages,
        cover,
        publisher,
        year: date,
        lang: "FR",
        snippet: "",
        isbn,
      };
    }).filter(b => b.title);
  } catch {
    return [];
  }
}

// ─── inventaire.io ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function invClaim(claims: any, prop: string) {
  return claims?.[prop]?.[0]?.value;
}

async function fetchInventaireByIsbn(isbn: string): Promise<GoogleBookResult | null> {
  try {
    const url = `https://inventaire.io/api/entities?action=by-uris&uris=isbn:${isbn}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const entity = data.entities?.[`isbn:${isbn}`];
    if (!entity) return null;

    const claims = entity.claims ?? {};
    const labels = entity.labels ?? {};
    const title: string = labels.fr ?? labels.en ?? (Object.values(labels) as string[])[0] ?? "";
    if (!title) return null;

    const author: string = invClaim(claims, "wdt:P2093") ?? "";
    const yearRaw: string | undefined = invClaim(claims, "wdt:P577");
    const year = yearRaw ? String(new Date(yearRaw).getFullYear()) : "";
    const pages: number = invClaim(claims, "wdt:P1104") ?? 0;
    const cover: string | null = entity.image?.url ?? null;

    return {
      id: `inv:isbn:${isbn}`,
      title,
      author,
      pages,
      cover,
      publisher: "",
      year,
      lang: "FR",
      snippet: "",
      isbn,
    };
  } catch {
    return null;
  }
}

async function fetchInventaireSearch(q: string): Promise<GoogleBookResult[]> {
  try {
    const url = `https://inventaire.io/api/entities?action=search&search=${encodeURIComponent(q)}&lang=fr&limit=12`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = data.results ?? [];

    return results.map((r, i) => {
      const desc: string = r.description ?? "";
      const yearMatch = desc.match(/,?\s*(\d{4})\s*$/);
      const year = yearMatch?.[1] ?? "";
      let author = desc.replace(/,?\s*\d{4}\s*$/, "").trim();
      author = author.replace(/^(?:roman|livre|essai|récit|biographie|ouvrage)\s+(?:de|d')\s*/i, "");
      author = author.replace(/^(?:de|d')\s*/i, "");

      return {
        id: `inv:${r.uri ?? i}`,
        title: r.label ?? "",
        author,
        pages: 0,
        cover: r.image?.url ?? null,
        publisher: "",
        year,
        lang: "FR",
        snippet: "",
        isbn: null,
      };
    }).filter(b => b.title);
  } catch {
    return [];
  }
}

// ─── Hardcover ────────────────────────────────────────────────────────────────

async function hcGraphQL(query: string, variables: Record<string, unknown>) {
  const apiKey = process.env.HARDCOVER_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.hardcover.app/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchHardcoverByIsbn(isbn: string): Promise<GoogleBookResult | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await hcGraphQL(`
      query($isbn: String!) {
        editions(where: {isbn_13: {_eq: $isbn}}, limit: 1) {
          isbn_13
          pages
          release_date
          book {
            id
            title
            description
            release_year
            release_date
            image { url }
            contributions { author { name } }
          }
        }
      }
    `, { isbn });
    const edition = data?.data?.editions?.[0];
    if (!edition?.book) return null;
    const book = edition.book;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const author = (book.contributions ?? []).map((c: any) => c.author?.name).filter(Boolean).join(", ");
    const releaseDate: string | undefined =
      (edition.release_date ?? book.release_date)?.slice(0, 10) || undefined;
    return {
      id: `hc:${book.id}`,
      title: book.title ?? "",
      author,
      pages: edition.pages ?? 0,
      cover: book.image?.url ?? null,
      publisher: "",
      year: book.release_year ? String(book.release_year) : "",
      lang: "FR",
      snippet: (book.description ?? "").slice(0, 200),
      isbn: edition.isbn_13 ?? isbn,
      releaseDate,
    };
  } catch {
    return null;
  }
}

async function fetchHardcover(q: string): Promise<GoogleBookResult[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await hcGraphQL(`
      query($q: String!) {
        search(query: $q, query_type: "Book", per_page: 12) {
          results
        }
      }
    `, { q });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits: any[] = data?.data?.search?.results?.hits ?? [];
    return hits.map((hit, i) => {
      const doc = hit.document ?? {};
      const releaseDate: string | undefined =
        (doc.release_date ?? doc.default_physical_edition?.release_date)?.slice(0, 10) || undefined;
      return {
        id: `hc:${doc.id ?? i}`,
        title: doc.title ?? "",
        author: (doc.author_names ?? []).join(", "),
        pages: doc.pages ?? 0,
        cover: doc.image?.url ?? null,
        publisher: "",
        year: doc.release_year ? String(doc.release_year) : "",
        lang: "FR",
        snippet: (doc.description ?? "").slice(0, 200),
        isbn: doc.default_physical_edition?.isbn_13 ?? null,
        releaseDate,
      };
    }).filter(b => b.title);
  } catch {
    return [];
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ items: [] });

  const isbn = isIsbn(q);
  const isbnDigits = q.replace(/[-\s]/g, "");
  const googleQuery = isbn ? `isbn:${isbnDigits}` : q;

  // 1. Hardcover (source principale)
  if (isbn) {
    const hcBook = await fetchHardcoverByIsbn(isbnDigits);
    if (hcBook) return NextResponse.json({ items: [hcBook], source: "hardcover" });
  } else {
    const hcItems = await fetchHardcover(q);
    if (hcItems.length) return NextResponse.json({ items: hcItems, source: "hardcover" });
  }

  // 2. Google Books
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=12&printType=books`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const items = mapGoogleBooks(data.items ?? []);
      if (items.length) return NextResponse.json({ items, source: "google" });
    }
  } catch { /* fall through */ }

  // 3. Open Library
  if (isbn) {
    const book = await fetchOLByIsbn(isbnDigits);
    if (book) return NextResponse.json({ items: [book], source: "openlibrary" });
  } else {
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const items = mapOpenLibrary(data.docs ?? []);
        if (items.length) return NextResponse.json({ items, source: "openlibrary" });
      }
    } catch { /* fall through */ }
  }

  // 4. BnF (Bibliothèque nationale de France)
  const bnfItems = await fetchBnF(isbn ? isbnDigits : q, isbn);
  if (bnfItems.length) return NextResponse.json({ items: bnfItems, source: "bnf" });

  // 5. inventaire.io
  if (isbn) {
    const invBook = await fetchInventaireByIsbn(isbnDigits);
    if (invBook) return NextResponse.json({ items: [invBook], source: "inventaire" });
  } else {
    const invItems = await fetchInventaireSearch(q);
    if (invItems.length) return NextResponse.json({ items: invItems, source: "inventaire" });
  }

  console.error("[Books search] No results from any source for:", q);
  return NextResponse.json({ items: [] });
}
