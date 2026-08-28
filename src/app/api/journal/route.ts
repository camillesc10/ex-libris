import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { journalEntries } from "@/lib/schema";
import { auth } from "@/auth";
import { createEvent } from "@/lib/events";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(journalEntries).orderBy(desc(journalEntries.date));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const db = getDb();
    const body = await req.json();
    await db.insert(journalEntries).values(body);

    if (userId && body.bookId && (body.pagesRead ?? 0) > 0) {
      await createEvent(db, userId, body.bookId, "journal_entry", {
        pagesRead: body.pagesRead ?? 0,
        page: body.page ?? null,
        note: body.note ?? "",
      });
    }

    return NextResponse.json(body, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
