import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sealedNotes } from "@/lib/schema";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(sealedNotes).orderBy(sealedNotes.page);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    await db.insert(sealedNotes).values(body);
    return NextResponse.json(body, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
