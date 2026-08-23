import { pgTable, text, integer, jsonb } from "drizzle-orm/pg-core";
import type { Platform } from "@/types";

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
  seriesNum: integer("series_num"),
});

export const lists = pgTable("lists", {
  name: text("name").primaryKey(),
  dot: text("dot").notNull(),
  desc: text("desc").default(""),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").default(""),
  passwordHash: text("password_hash").notNull(),
});
