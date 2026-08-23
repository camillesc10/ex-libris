import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { books as booksTable } from "@/lib/schema";
import { SEED_BOOKS } from "@/store/data";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(booksTable);
    if (rows.length === 0) {
      await db.insert(booksTable).values(SEED_BOOKS);
      return NextResponse.json(SEED_BOOKS);
    }
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(SEED_BOOKS);
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const book = await req.json();
    await db.insert(booksTable).values(book);
    return NextResponse.json(book, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
