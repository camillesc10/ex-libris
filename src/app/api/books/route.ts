import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { books as booksTable, userBooks as userBooksTable } from "@/lib/schema";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  try {
    const db = getDb();

    // If user_books exists and we have a userId, use the join-based model
    if (userId) {
      const rows = await db
        .select()
        .from(booksTable)
        .innerJoin(
          userBooksTable,
          and(eq(userBooksTable.bookId, booksTable.id), eq(userBooksTable.userId, userId))
        );
      {
        const result = rows.map(({ books: b, user_books: ub }) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          year: b.year ?? "",
          genre: b.genre ?? "",
          lang: b.lang ?? "",
          pages: b.pages ?? 0,
          series: b.series,
          seriesNum: b.seriesNum,
          coverUrl: b.coverUrl,
          spice: ub.spice ?? 0,
          rating: ub.rating ?? 0,
          page: ub.page ?? 0,
          tropes: b.tropes ?? [],
          lists: ub.lists ?? [],
          resume: ub.resume ?? "",
          comment: ub.comment ?? "",
          bg: ub.bg,
          ink: ub.ink,
          platforms: ub.platforms ?? [],
          startedAt: ub.startedAt?.replace(/\//g, "-"),
          finishedAt: ub.finishedAt?.replace(/\//g, "-"),
          pageNotes: ub.pageNotes ?? [],
          pros: ub.pros ?? "",
          cons: ub.cons ?? "",
          quote: ub.quote ?? "",
          dnfReason: ub.dnfReason ?? "",
          relatedBooks: ub.relatedBooks ?? [],
          reminderDate: ub.reminderDate,
          releaseDate: ub.releaseDate,
        }));
        return NextResponse.json(result);
      }
    }

    // Fallback uniquement si non authentifié (pré-migration)
    if (!userId) {
      const rows = await db.select().from(booksTable);
      return NextResponse.json(rows);
    }
    return NextResponse.json([]);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = session.user.id;
  try {
    const db = getDb();
    const book = await req.json();
    const { id, title, author, year, genre, lang, pages, series, seriesNum, coverUrl, bg, ink, ...rest } = book;

    await db.insert(booksTable).values({ id, title, author, year, genre, lang, pages, series, seriesNum, coverUrl, bg: bg ?? "#1E1B4B", ink: ink ?? "#E8E3F0", tropes: rest.tropes ?? [] }).onConflictDoNothing();
    await db.insert(userBooksTable).values({
      id: crypto.randomUUID(),
      userId,
      bookId: id,
      bg: bg ?? "#1E1B4B",
      ink: ink ?? "#E8E3F0",
      spice: rest.spice ?? 0,
      rating: rest.rating ?? 0,
      page: rest.page ?? 0,
      tropes: [],
      lists: rest.lists ?? [],
      resume: rest.resume ?? "",
      comment: rest.comment ?? "",
      platforms: rest.platforms ?? [],
      startedAt: rest.startedAt,
      finishedAt: rest.finishedAt,
      pageNotes: rest.pageNotes ?? [],
      pros: rest.pros ?? "",
      cons: rest.cons ?? "",
      quote: rest.quote ?? "",
      dnfReason: rest.dnfReason ?? "",
      relatedBooks: rest.relatedBooks ?? [],
      reminderDate: rest.reminderDate,
      releaseDate: rest.releaseDate,
    });
    return NextResponse.json(book, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
