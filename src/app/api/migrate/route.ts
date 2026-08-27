import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

  const sql = neon(url);

  await sql`DROP TABLE IF EXISTS conversations`;

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

  await sql`DROP TABLE IF EXISTS club_proposals`;

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

  // Nettoyage colonnes legacy sur books (données personnelles déplacées vers user_books)
  const bookColsToDrop = [
    "rating", "started_at", "finished_at", "page_notes",
    "spice", "page", "lists", "resume", "comment", "platforms",
    "pros", "cons", "quote", "dnf_reason", "related_books", "reminder_date",
  ];
  for (const col of bookColsToDrop) {
    await sql`ALTER TABLE books DROP COLUMN IF EXISTS ${sql.unsafe(col)}`;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS tropes_catalog (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `;

  // S'assurer que la colonne category n'existe plus (migration idempotente)
  await sql`ALTER TABLE tropes_catalog DROP COLUMN IF EXISTS category`;

  const TROPES: { id: string; name: string }[] = [
    // Romance
    { id: "enemies-to-lovers",    name: "Enemies to Lovers" },
    { id: "friends-to-lovers",    name: "Friends to Lovers" },
    { id: "slow-burn",            name: "Slow Burn" },
    { id: "forced-proximity",     name: "Forced Proximity" },
    { id: "fake-dating",          name: "Fake Dating" },
    { id: "love-triangle",        name: "Love Triangle" },
    { id: "second-chance",        name: "Second Chance Romance" },
    { id: "forbidden-love",       name: "Forbidden Love" },
    { id: "one-bed",              name: "One Bed" },
    { id: "grumpy-sunshine",      name: "Grumpy x Sunshine" },
    { id: "opposites-attract",    name: "Opposites Attract" },
    { id: "childhood-sweethearts",name: "Childhood Sweethearts" },
    { id: "instalove",            name: "Instalove" },
    { id: "arranged-marriage",    name: "Arranged Marriage" },
    { id: "beauty-beast",         name: "Beauty and the Beast" },
    { id: "cinderella",           name: "Cinderella" },
    { id: "bodyguard",            name: "Bodyguard Romance" },
    { id: "celebrity-ordinary",   name: "Celebrity x Ordinary" },
    { id: "boss-employee",        name: "Boss x Employee" },
    { id: "age-gap",              name: "Age Gap" },
    { id: "the-bet",              name: "The Bet" },
    { id: "fake-relationship",    name: "Fake Relationship" },
    { id: "miscommunication",     name: "Miscommunication" },
    { id: "brothers-best-friend", name: "Brother's Best Friend" },
    { id: "roommates",            name: "Roommates" },
    { id: "sports-romance",       name: "Sports Romance" },
    { id: "small-town",           name: "Small Town Romance" },
    { id: "road-trip",            name: "Road Trip Romance" },
    { id: "holiday-romance",      name: "Holiday Romance" },
    { id: "amnesia",              name: "Amnesia" },
    { id: "hurt-comfort",         name: "Hurt/Comfort" },
    { id: "protector",            name: "Protector Romance" },
    { id: "revenge-romance",      name: "Revenge Romance" },
    { id: "found-family-romance", name: "Found Family Romance" },
    // Fantasy
    { id: "chosen-one",           name: "The Chosen One" },
    { id: "hidden-world",         name: "Hidden World" },
    { id: "quest",                name: "Quest" },
    { id: "magical-academy",      name: "Magical Academy" },
    { id: "lost-heir",            name: "Lost Heir" },
    { id: "forbidden-magic",      name: "Forbidden Magic" },
    { id: "prophecy",             name: "Prophecy" },
    { id: "portal-fantasy",       name: "Portal Fantasy" },
    { id: "resistance-vs-empire", name: "Resistance vs Empire" },
    { id: "unlikely-alliance",    name: "Unlikely Alliance" },
    { id: "dark-vs-light",        name: "Dark vs Light" },
    { id: "ancient-evil",         name: "Ancient Evil Awakened" },
    { id: "magical-species",      name: "Magical Species" },
    { id: "complex-magic-system", name: "Complex Magic System" },
    { id: "political-intrigue",   name: "Political Intrigue" },
    { id: "monster-romance",      name: "Monster Romance" },
  ];

  for (const t of TROPES) {
    await sql`
      INSERT INTO tropes_catalog (id, name)
      VALUES (${t.id}, ${t.name})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Unicité du pseudo sur users
  await sql`ALTER TABLE users ADD CONSTRAINT users_name_unique UNIQUE (name)`.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS activity_events (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      book_id     TEXT NOT NULL,
      type        TEXT NOT NULL,
      payload     JSONB DEFAULT '{}',
      created_at  TEXT NOT NULL
    )
  `;

  // Colonne release_date sur user_books (ajoutée après la migration initiale)
  await sql`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS release_date TEXT`.catch(() => {});

  return NextResponse.json({ ok: true, message: "Tables créées et données migrées." });
}
