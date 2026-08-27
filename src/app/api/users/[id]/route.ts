import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, books, userBooks } from "@/lib/schema";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const [user] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const rows = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        coverUrl: books.coverUrl,
        bg: books.bg,
        ink: books.ink,
        series: books.series,
        rating: userBooks.rating,
        lists: userBooks.lists,
        spice: userBooks.spice,
        startedAt: userBooks.startedAt,
        finishedAt: userBooks.finishedAt,
      })
      .from(userBooks)
      .innerJoin(books, eq(books.id, userBooks.bookId))
      .where(and(eq(userBooks.userId, id)));

    const booksRead = rows.filter((b) => (b.lists as string[]).includes("Déjà lu")).length;
    const ratedBooks = rows.filter((b) => (b.rating ?? 0) > 0);
    const avgRating = ratedBooks.length
      ? ratedBooks.reduce((s, b) => s + (b.rating ?? 0), 0) / ratedBooks.length
      : 0;

    return NextResponse.json({
      id: user.id,
      name: user.name,
      booksRead,
      booksTotal: rows.length,
      avgRating: Math.round(avgRating * 10) / 10,
      books: rows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
