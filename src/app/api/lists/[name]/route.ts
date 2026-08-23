import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { lists as listsTable, books as booksTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const db = getDb();
    await db.delete(listsTable).where(eq(listsTable.name, decoded));
    const allBooks = await db.select().from(booksTable);
    await Promise.all(
      allBooks
        .filter((b) => (b.lists as string[]).includes(decoded))
        .map((b) =>
          db
            .update(booksTable)
            .set({ lists: (b.lists as string[]).filter((l) => l !== decoded) })
            .where(eq(booksTable.id, b.id))
        )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
