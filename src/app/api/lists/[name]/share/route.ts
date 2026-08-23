import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { lists as listsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const { shareCode } = await req.json() as { shareCode: string };
    const db = getDb();
    await db.update(listsTable).set({ shareCode }).where(eq(listsTable.name, decoded));
    return NextResponse.json({ ok: true, shareCode });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
