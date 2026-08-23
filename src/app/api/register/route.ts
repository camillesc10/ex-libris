import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password || password.length < 4) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    const db = getDb();
    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing) return NextResponse.json({ error: "Ce compte existe déjà." }, { status: 409 });
    const passwordHash = await hash(password, 12);
    await db.insert(users).values({ id: randomUUID(), email: email.toLowerCase(), name: name || "", passwordHash });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
