import { NextResponse } from "next/server";
import { ilike } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const db = getDb();
    const rows = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(ilike(users.name, `%${q}%`))
      .limit(10);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
