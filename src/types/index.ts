export type Theme = "constelle" | "velin";
export type Layout = "colonnes" | "immersif";
export type Flow = "fil" | "jalons";
export type Screen = "shelf" | "search" | "lists" | "activity" | "journal" | "timeline" | "series" | "me" | "profile";

export interface Platform {
  name: string;
  langs: string;
}

export interface PageNote {
  page: number;
  text: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  bookId: string;
  pagesRead: number;
  note: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  lang: string;
  spice: number;
  rating: number;
  pages: number;
  page: number;
  tropes: string[];
  lists: string[];
  resume: string;
  comment: string;
  bg: string;
  ink: string;
  platforms: Platform[];
  startedAt?: string;
  finishedAt?: string;
  series?: string;
  seriesNum?: number;
  pageNotes?: PageNote[];
  pros?: string;
  cons?: string;
  quote?: string;
  dnfReason?: string;
  relatedBooks?: string[];
  reminderDate?: string;
  releaseDate?: string;
  coverUrl?: string;
}

export interface BookList {
  name: string;
  dot: string;
  desc: string;
  shareCode?: string;
}

export interface SearchResult {
  key: string;
  title: string;
  author: string;
  year: string;
  snippet: string;
  cover: string;
  pages: number;
  lang: string;
  isbn?: string;
  releaseDate?: string;
  inLibrary?: boolean;
}
