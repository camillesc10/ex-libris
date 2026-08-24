import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { lists as listsTable, userBooks as userBooksTable } from "@/lib/schema";
import { auth } from "@/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = session.user.id;
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const db = getDb();
    await db.delete(listsTable).where(eq(listsTable.name, decoded));
    const affected = await db.select().from(userBooksTable).where(eq(userBooksTable.userId, userId));
    await Promise.all(
      affected
        .filter((ub) => (ub.lists as string[]).includes(decoded))
        .map((ub) =>
          db
            .update(userBooksTable)
            .set({ lists: (ub.lists as string[]).filter((l) => l !== decoded) })
            .where(and(eq(userBooksTable.bookId, ub.bookId), eq(userBooksTable.userId, userId)))
        )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
