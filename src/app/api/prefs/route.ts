import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { userPrefs } from "@/lib/schema";

const PREFS_ID = "default";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(userPrefs).where(eq(userPrefs.id, PREFS_ID));
    return NextResponse.json(rows[0] ?? { id: PREFS_ID, shelfColors: {}, yearGoal: 0, readBook: "", myPage: 0 });
  } catch {
    return NextResponse.json({ id: PREFS_ID, shelfColors: {}, yearGoal: 0, readBook: "", myPage: 0 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    await db
      .insert(userPrefs)
      .values({ id: PREFS_ID, ...body })
      .onConflictDoUpdate({ target: userPrefs.id, set: body });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
