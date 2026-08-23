export type Theme = "constelle" | "velin";
export type Layout = "colonnes" | "immersif";
export type Flow = "fil" | "jalons";
export type Screen = "shelf" | "search" | "lists" | "messages" | "sync" | "authors" | "journal" | "timeline" | "club" | "compare";

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
}

export interface BookList {
  name: string;
  dot: string;
  desc: string;
  shareCode?: string;
}

export interface Message {
  from: "me" | "them";
  text?: string;
  book?: string;
}

export interface Conversation {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  time: string;
  messages: Message[];
}

export interface SealedNote {
  page: number;
  who: string;
  text: string;
  when: string;
}

export interface Reader {
  name: string;
  page: number;
  color: string;
}

export interface Proposal {
  bookId: string;
  votes: number;
  votedByMe: boolean;
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
}
