import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { activityEvents, books, users } from "@/lib/schema";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: activityEvents.id,
        userId: activityEvents.userId,
        bookId: activityEvents.bookId,
        type: activityEvents.type,
        payload: activityEvents.payload,
        createdAt: activityEvents.createdAt,
        userName: users.name,
        bookTitle: books.title,
        bookAuthor: books.author,
        bookCoverUrl: books.coverUrl,
        bookBg: books.bg,
        bookInk: books.ink,
      })
      .from(activityEvents)
      .innerJoin(users, eq(users.id, activityEvents.userId))
      .innerJoin(books, eq(books.id, activityEvents.bookId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(50);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
