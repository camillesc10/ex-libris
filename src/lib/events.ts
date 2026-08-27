import { randomUUID } from "crypto";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { activityEvents } from "./schema";
import type * as schema from "./schema";

export async function createEvent(
  db: NeonHttpDatabase<typeof schema>,
  userId: string,
  bookId: string,
  type: string,
  payload: Record<string, unknown> = {}
) {
  await db.insert(activityEvents).values({
    id: randomUUID(),
    userId,
    bookId,
    type,
    payload,
    createdAt: new Date().toISOString(),
  }).catch(() => {});
}
