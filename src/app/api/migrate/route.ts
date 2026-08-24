import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      initial     TEXT NOT NULL,
      avatar_bg   TEXT NOT NULL,
      time        TEXT DEFAULT '',
      messages    JSONB DEFAULT '[]'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sealed_notes (
      id          TEXT PRIMARY KEY,
      page        INTEGER NOT NULL,
      who         TEXT NOT NULL,
      note_text   TEXT NOT NULL,
      "when"      TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id          TEXT PRIMARY KEY,
      date        TEXT NOT NULL,
      book_id     TEXT NOT NULL,
      pages_read  INTEGER DEFAULT 0,
      note        TEXT DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS club_proposals (
      book_id     TEXT PRIMARY KEY,
      votes       INTEGER DEFAULT 1,
      voted_by_me BOOLEAN DEFAULT FALSE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_prefs (
      id           TEXT PRIMARY KEY,
      shelf_colors JSONB DEFAULT '{}',
      year_goal    INTEGER DEFAULT 0,
      read_book    TEXT DEFAULT '',
      my_page      INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_books (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL,
      book_id       TEXT NOT NULL,
      spice         INTEGER DEFAULT 0,
      rating        INTEGER DEFAULT 0,
      page          INTEGER DEFAULT 0,
      tropes        JSONB DEFAULT '[]',
      lists         JSONB DEFAULT '[]',
      resume        TEXT DEFAULT '',
      comment       TEXT DEFAULT '',
      bg            TEXT NOT NULL DEFAULT '#1E1B4B',
      ink           TEXT NOT NULL DEFAULT '#E8E3F0',
      platforms     JSONB DEFAULT '[]',
      started_at    TEXT,
      finished_at   TEXT,
      page_notes    JSONB DEFAULT '[]',
      pros          TEXT DEFAULT '',
      cons          TEXT DEFAULT '',
      quote         TEXT DEFAULT '',
      dnf_reason    TEXT DEFAULT '',
      related_books JSONB DEFAULT '[]',
      reminder_date TEXT,
      UNIQUE(user_id, book_id)
    )
  `;

  // Copy existing book data to user_books for each existing user (migration from single-table model)
  await sql`
    INSERT INTO user_books (
      id, user_id, book_id, spice, rating, page, tropes, lists, resume, comment,
      bg, ink, platforms, started_at, finished_at, page_notes, pros, cons,
      quote, dnf_reason, related_books, reminder_date
    )
    SELECT
      gen_random_uuid()::text,
      u.id,
      b.id,
      COALESCE(b.spice, 0),
      COALESCE(b.rating, 0),
      COALESCE(b.page, 0),
      COALESCE(b.tropes, '[]'::jsonb),
      COALESCE(b.lists, '[]'::jsonb),
      COALESCE(b.resume, ''),
      COALESCE(b.comment, ''),
      COALESCE(b.bg, '#1E1B4B'),
      COALESCE(b.ink, '#E8E3F0'),
      COALESCE(b.platforms, '[]'::jsonb),
      b.started_at,
      b.finished_at,
      COALESCE(b.page_notes, '[]'::jsonb),
      COALESCE(b.pros, ''),
      COALESCE(b.cons, ''),
      COALESCE(b.quote, ''),
      COALESCE(b.dnf_reason, ''),
      COALESCE(b.related_books, '[]'::jsonb),
      b.reminder_date
    FROM books b
    CROSS JOIN users u
    ON CONFLICT (user_id, book_id) DO NOTHING
  `;

  return NextResponse.json({ ok: true, message: "Tables créées et données migrées." });
}
