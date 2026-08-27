import { randomUUID } from "crypto";
import { activityEvents } from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createEvent(
  db: any,
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
