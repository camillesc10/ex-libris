import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { books as booksTable, userBooks as userBooksTable } from "@/lib/schema";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });
  const userId = session.user.id;
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(booksTable)
      .innerJoin(
        userBooksTable,
        and(eq(userBooksTable.bookId, booksTable.id), eq(userBooksTable.userId, userId))
      );
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
      tropes: ub.tropes ?? [],
      lists: ub.lists ?? [],
      resume: ub.resume ?? "",
      comment: ub.comment ?? "",
      bg: ub.bg,
      ink: ub.ink,
      platforms: ub.platforms ?? [],
      startedAt: ub.startedAt,
      finishedAt: ub.finishedAt,
      pageNotes: ub.pageNotes ?? [],
      pros: ub.pros ?? "",
      cons: ub.cons ?? "",
      quote: ub.quote ?? "",
      dnfReason: ub.dnfReason ?? "",
      relatedBooks: ub.relatedBooks ?? [],
      reminderDate: ub.reminderDate,
    }));
    return NextResponse.json(result);
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

    await db.insert(booksTable).values({ id, title, author, year, genre, lang, pages, series, seriesNum, coverUrl, bg: bg ?? "#1E1B4B", ink: ink ?? "#E8E3F0" }).onConflictDoNothing();
    await db.insert(userBooksTable).values({
      id: crypto.randomUUID(),
      userId,
      bookId: id,
      bg: bg ?? "#1E1B4B",
      ink: ink ?? "#E8E3F0",
      spice: rest.spice ?? 0,
      rating: rest.rating ?? 0,
      page: rest.page ?? 0,
      tropes: rest.tropes ?? [],
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
    });
    return NextResponse.json(book, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
