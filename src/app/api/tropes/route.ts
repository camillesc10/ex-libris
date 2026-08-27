import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tropesCatalog } from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const tropes = await db
      .select()
      .from(tropesCatalog)
      .orderBy(asc(tropesCatalog.name));
    return NextResponse.json(tropes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tropes" }, { status: 500 });
  }
}
