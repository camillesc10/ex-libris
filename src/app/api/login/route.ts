import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!user) return NextResponse.json({ error: "Compte introuvable." }, { status: 401 });
    const ok = await compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    return NextResponse.json({ name: user.name || "Lectrice", email: user.email });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
