import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ genres: [], tropes: [] });

  const title = req.nextUrl.searchParams.get("title") ?? "";
  const author = req.nextUrl.searchParams.get("author") ?? "";
  if (!title) return NextResponse.json({ genres: [], tropes: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchData: any = await hcPost(
    `query($q: String!) { search(query: $q, query_type: "Book", per_page: 5) { results } }`,
    { q: `${title} ${author}` }
  );
  const hits: unknown[] = searchData?.data?.search?.results?.hits ?? [];
  if (!hits.length) return NextResponse.json({ genres: [], tropes: [] });

  const normTitle = norm(title).slice(0, 12);
  const normAuthor = norm(author).slice(0, 8);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchBoth = (h: any) =>
    norm(h.document?.title ?? "").includes(normTitle) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (h.document?.author_names as string[] ?? []).some((a: string) => norm(a).includes(normAuthor));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchAuthor = (h: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (h.document?.author_names as string[] ?? []).some((a: string) => norm(a).includes(normAuthor));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const best: any = hits.find(matchBoth) ?? hits.find(matchAuthor) ?? hits[0];

  const genres: string[] = best?.document?.genres ?? [];
  const bookId = parseInt(best?.document?.id ?? "0");

  // 2ème appel : cached_tags pour les tropes (Tag) et genres complémentaires (Genre)
  let tropes: string[] = [];
  if (bookId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tagData: any = await hcPost(
      `query($id: Int!) { books(where:{id:{_eq:$id}},limit:1) { cached_tags } }`,
      { id: bookId }
    );
    const cached = tagData?.data?.books?.[0]?.cached_tags;
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tropes = (cached.Tag ?? []).map((t: any) => t.tag as string);
      // Si cached_tags.Genre est plus complet, l'utiliser à la place
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cachedGenres: string[] = (cached.Genre ?? []).map((g: any) => g.tag as string);
      if (cachedGenres.length > genres.length) {
        return NextResponse.json({ genres: cachedGenres, tropes });
      }
    }
  }

  return NextResponse.json({ genres, tropes });
}
