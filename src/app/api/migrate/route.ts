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

  return NextResponse.json({ ok: true, message: "Tables créées (ou déjà existantes)." });
}
