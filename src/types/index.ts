export type Theme = "constelle" | "velin";
export type Layout = "colonnes" | "immersif";
export type Flow = "fil" | "jalons";
export type Screen = "shelf" | "search" | "lists" | "messages" | "sync";

export interface Platform {
  name: string;
  langs: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  lang: string;
  spice: number; // 0–5
  rating: number; // 0–5
  pages: number;
  page: number; // current reading page
  tropes: string[];
  lists: string[];
  resume: string;
  comment: string;
  bg: string;
  ink: string;
  platforms: Platform[];
}

export interface BookList {
  name: string;
  dot: string;
  desc: string;
}

export interface Message {
  from: "me" | "them";
  text?: string;
  book?: string; // book id
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

export interface SearchResult {
  key: string;
  title: string;
  author: string;
  year: string;
  snippet: string;
  cover: string;
  pages: number;
  lang: string;
}
