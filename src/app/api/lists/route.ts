import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { lists as listsTable } from "@/lib/schema";
import { SEED_LISTS } from "@/store/data";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(listsTable);
    if (rows.length === 0) {
      await db.insert(listsTable).values(SEED_LISTS);
      return NextResponse.json(SEED_LISTS);
    }
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(SEED_LISTS);
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const list = await req.json();
    await db.insert(listsTable).values(list).onConflictDoNothing();
    return NextResponse.json(list, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
