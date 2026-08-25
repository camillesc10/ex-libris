import { pgTable, text, integer, real, jsonb, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import type { Platform, PageNote } from "@/types";

export const books = pgTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  year: text("year").default(""),
  genre: text("genre").default(""),
  lang: text("lang").default(""),
  spice: integer("spice").default(0),
  rating: integer("rating").default(0),
  pages: integer("pages").default(0),
  page: integer("page").default(0),
  tropes: jsonb("tropes").$type<string[]>().default([]),
  lists: jsonb("lists").$type<string[]>().default([]),
  resume: text("resume").default(""),
  comment: text("comment").default(""),
  bg: text("bg").notNull(),
  ink: text("ink").notNull(),
  platforms: jsonb("platforms").$type<Platform[]>().default([]),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  series: text("series"),
  seriesNum: real("series_num"),
  pageNotes: jsonb("page_notes").$type<PageNote[]>().default([]),
  pros: text("pros").default(""),
  cons: text("cons").default(""),
  quote: text("quote").default(""),
  dnfReason: text("dnf_reason").default(""),
  relatedBooks: jsonb("related_books").$type<string[]>().default([]),
  reminderDate: text("reminder_date"),
  coverUrl: text("cover_url"),
});

export const lists = pgTable("lists", {
  name: text("name").primaryKey(),
  dot: text("dot").notNull(),
  desc: text("desc").default(""),
  shareCode: text("share_code"),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").default(""),
  passwordHash: text("password_hash").notNull(),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  initial: text("initial").notNull(),
  avatarBg: text("avatar_bg").notNull(),
  time: text("time").default(""),
  messages: jsonb("messages").$type<import("@/types").Message[]>().default([]),
});

export const sealedNotes = pgTable("sealed_notes", {
  id: text("id").primaryKey(),
  page: integer("page").notNull(),
  who: text("who").notNull(),
  noteText: text("note_text").notNull(),
  when: text("when").notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  bookId: text("book_id").notNull(),
  pagesRead: integer("pages_read").default(0),
  note: text("note").default(""),
});

export const clubProposals = pgTable("club_proposals", {
  bookId: text("book_id").primaryKey(),
  votes: integer("votes").default(1),
  votedByMe: boolean("voted_by_me").default(false),
});

export const userBooks = pgTable("user_books", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  bookId: text("book_id").notNull(),
  spice: integer("spice").default(0),
  rating: integer("rating").default(0),
  page: integer("page").default(0),
  tropes: jsonb("tropes").$type<string[]>().default([]),
  lists: jsonb("lists").$type<string[]>().default([]),
  resume: text("resume").default(""),
  comment: text("comment").default(""),
  bg: text("bg").notNull().default("#1E1B4B"),
  ink: text("ink").notNull().default("#E8E3F0"),
  platforms: jsonb("platforms").$type<Platform[]>().default([]),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  pageNotes: jsonb("page_notes").$type<PageNote[]>().default([]),
  pros: text("pros").default(""),
  cons: text("cons").default(""),
  quote: text("quote").default(""),
  dnfReason: text("dnf_reason").default(""),
  relatedBooks: jsonb("related_books").$type<string[]>().default([]),
  reminderDate: text("reminder_date"),
  releaseDate: text("release_date"),
}, (t) => [uniqueIndex("user_books_unique_idx").on(t.userId, t.bookId)]);

export const userPrefs = pgTable("user_prefs", {
  id: text("id").primaryKey(),
  shelfColors: jsonb("shelf_colors").$type<Record<string, string>>().default({}),
  yearGoal: integer("year_goal").default(0),
  readBook: text("read_book").default(""),
  myPage: integer("my_page").default(0),
});

export const tropesCatalog = pgTable("tropes_catalog", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
});
