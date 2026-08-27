import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { books as booksTable, userBooks as userBooksTable } from "@/lib/schema";
import { auth } from "@/auth";
import { createEvent } from "@/lib/events";

const BOOK_FIELDS = new Set(["title", "author", "year", "genre", "lang", "pages", "series", "seriesNum", "coverUrl", "tropes"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = session.user.id;
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    const bookData: Record<string, unknown> = {};
    const userBookData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k === "id") continue;
      if (BOOK_FIELDS.has(k)) bookData[k] = v;
      else userBookData[k] = v;
    }

    // Read current state to detect meaningful transitions
    const [current] = await db
      .select({ lists: userBooksTable.lists, rating: userBooksTable.rating })
      .from(userBooksTable)
      .where(and(eq(userBooksTable.bookId, id), eq(userBooksTable.userId, userId)))
      .limit(1);

    if (Object.keys(bookData).length > 0) {
      await db.update(booksTable).set(bookData).where(eq(booksTable.id, id));
    }
    if (Object.keys(userBookData).length > 0) {
      await db.update(userBooksTable)
        .set(userBookData)
        .where(and(eq(userBooksTable.bookId, id), eq(userBooksTable.userId, userId)));
    }

    if (current) {
      const oldLists = (current.lists as string[]) ?? [];
      const newLists = (userBookData.lists as string[] | undefined) ?? oldLists;
      const oldRating = current.rating ?? 0;
      const newRating = (userBookData.rating as number | undefined) ?? oldRating;

      if (!oldLists.includes("Déjà lu") && newLists.includes("Déjà lu")) {
        await createEvent(db, userId, id, "book_finished", { rating: newRating });
      } else if (!oldLists.includes("Abandonné") && newLists.includes("Abandonné")) {
        await createEvent(db, userId, id, "book_abandoned");
      } else if (oldRating === 0 && newRating > 0) {
        await createEvent(db, userId, id, "rating_given", { rating: newRating });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = session.user.id;
  try {
    const { id } = await params;
    const db = getDb();
    await db.delete(userBooksTable).where(and(eq(userBooksTable.bookId, id), eq(userBooksTable.userId, userId)));
    // Supprimer aussi le livre si aucun autre utilisateur ne l'a dans sa bibliothèque
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userBooksTable)
      .where(eq(userBooksTable.bookId, id));
    if (count === 0) {
      await db.delete(booksTable).where(eq(booksTable.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
