import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { books as booksTable, userBooks as userBooksTable } from "@/lib/schema";
import { auth } from "@/auth";

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

    if (Object.keys(bookData).length > 0) {
      await db.update(booksTable).set(bookData).where(eq(booksTable.id, id));
    }
    if (Object.keys(userBookData).length > 0) {
      await db.update(userBooksTable)
        .set(userBookData)
        .where(and(eq(userBooksTable.bookId, id), eq(userBooksTable.userId, userId)));
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
