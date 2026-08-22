"use client";
import { create } from "zustand";
import type {
  Theme, Layout, Flow, Screen,
  Book, BookList, Conversation, SealedNote, Reader, SearchResult,
} from "@/types";
import {
  SEED_BOOKS, SEED_LISTS, SEED_CONVOS, SEED_NOTES, SEED_READERS,
  COVER_PALETTE,
} from "./data";

interface AppState {
  // Auth
  auth: boolean;
  mode: "login" | "signup";
  form: { name: string; email: string; pass: string };
  authError: string;
  user: string;

  // Prefs
  theme: Theme;
  layout: Layout;
  flow: Flow;
  showTip: boolean;

  // Navigation
  screen: Screen;
  listFilter: string | null;
  open: string | null; // book id of open sheet

  // Library
  books: Book[];
  lists: BookList[];
  newList: string;

  // Filters
  genre: string;
  maxSpice: number;

  // Search
  query: string;
  results: SearchResult[];
  searching: boolean;
  source: string;
  added: string[];

  // Messaging
  convos: Conversation[];
  convo: string;
  draft: string;
  pal: string[]; // book ids added from messages

  // Shared reading
  readBook: string;
  readers: Reader[];
  invites: string[];
  myPage: number;
  pageInput: string;
  notes: SealedNote[];
  notePage: string;
  noteText: string;

  // UI
  toast: string;
  toastTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  submitAuth: () => void;
  toggleAuth: () => void;
  setFormField: (k: "name" | "email" | "pass", v: string) => void;
  logout: () => void;

  setTheme: (t: Theme) => void;
  setLayout: (l: Layout) => void;
  setFlow: (f: Flow) => void;
  dismissTip: () => void;

  navigate: (s: Screen) => void;
  setListFilter: (name: string | null) => void;
  openBook: (id: string | null) => void;

  patchBook: (id: string, fn: (b: Book) => Book) => void;
  addPlatform: (bookId: string, raw: string) => void;

  setGenre: (g: string) => void;
  setMaxSpice: (n: number) => void;

  setQuery: (q: string) => void;
  runSearch: () => Promise<void>;
  addFromApi: (r: SearchResult) => void;

  addList: () => void;
  setNewList: (v: string) => void;

  openConvo: (id: string) => void;
  setDraft: (v: string) => void;
  sendDraft: () => void;
  addToMyPal: (bookId: string) => void;

  setReadBook: (id: string) => void;
  toggleInvite: (name: string) => void;
  launchRead: () => void;
  setPageInput: (v: string) => void;
  declarePage: () => void;
  setNotePage: (v: string) => void;
  setNoteText: (v: string) => void;
  addNote: () => void;

  ping: (msg: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  auth: false,
  mode: "login",
  form: { name: "", email: "lila@exemple.fr", pass: "" },
  authError: "",
  user: "Lila",

  theme: "lavande",
  layout: "colonnes",
  flow: "fil",
  showTip: true,

  screen: "shelf",
  listFilter: null,
  open: null,

  books: SEED_BOOKS.map((b) => ({ ...b })),
  lists: SEED_LISTS.map((l) => ({ ...l })),
  newList: "",

  genre: "Tous",
  maxSpice: 5,

  query: "",
  results: [],
  searching: false,
  source: "",
  added: [],

  convos: SEED_CONVOS.map((c) => ({ ...c, messages: [...c.messages] })),
  convo: "c1",
  draft: "",
  pal: [],

  readBook: "b1",
  readers: SEED_READERS.map((r) => ({ ...r })),
  invites: ["Camille"],
  myPage: 214,
  pageInput: "214",
  notes: [...SEED_NOTES],
  notePage: "230",
  noteText: "",

  toast: "",
  toastTimer: null,

  // ── Auth ──
  submitAuth() {
    const { form, mode } = get();
    if (!/.+@.+\..+/.test(form.email)) {
      set({ authError: "Il manque un e-mail valide." });
      return;
    }
    if (form.pass.length < 4) {
      set({ authError: "Mot de passe : 4 caractères minimum." });
      return;
    }
    set({ auth: true, authError: "", user: mode === "signup" ? (form.name || "Toi") : "Lila" });
  },

  toggleAuth() {
    set((s) => ({ mode: s.mode === "login" ? "signup" : "login", authError: "" }));
  },

  setFormField(k, v) {
    set((s) => ({ form: { ...s.form, [k]: v }, authError: "" }));
  },

  logout() {
    set({ auth: false, mode: "login" });
  },

  // ── Prefs ──
  setTheme: (t) => set({ theme: t }),
  setLayout: (l) => set({ layout: l }),
  setFlow: (f) => set({ flow: f }),
  dismissTip: () => set({ showTip: false }),

  // ── Navigation ──
  navigate(s) {
    set({ screen: s, listFilter: null });
  },

  setListFilter(name) {
    set({ screen: "shelf", listFilter: name, genre: "Tous", maxSpice: 5 });
  },

  openBook(id) {
    set({ open: id });
  },

  // ── Library ──
  patchBook(id, fn) {
    set((s) => ({ books: s.books.map((b) => (b.id === id ? fn(b) : b)) }));
  },

  addPlatform(bookId, raw) {
    const [name, langs = ""] = raw.split("·").map((p) => p.trim());
    if (!name) return;
    get().patchBook(bookId, (b) => ({
      ...b,
      platforms: [...b.platforms, { name, langs }],
    }));
  },

  // ── Filters ──
  setGenre: (g) => set({ genre: g }),
  setMaxSpice: (n) => set((s) => ({ maxSpice: s.maxSpice === n ? 5 : n })),

  // ── Search ──
  setQuery: (q) => set({ query: q }),

  async runSearch() {
    const q = get().query.trim();
    if (!q) return;
    set({ screen: "search", searching: true, results: [], source: "Google Books" });
    let rs: SearchResult[] = [];
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?maxResults=12&q=${encodeURIComponent(q)}`
      );
      const j = await res.json();
      rs = (j.items || []).map((it: Record<string, unknown>) => {
        const v = (it.volumeInfo as Record<string, unknown>) || {};
        const imageLinks = (v.imageLinks as Record<string, string>) || {};
        return {
          key: it.id as string,
          title: (v.title as string) || "Sans titre",
          author: ((v.authors as string[]) || ["Auteur inconnu"]).join(", "),
          year: ((v.publishedDate as string) || "").slice(0, 4) || "—",
          snippet: ((v.description as string) || "Pas de résumé fourni par l'API.").slice(0, 180) + "…",
          cover: imageLinks.thumbnail ? imageLinks.thumbnail.replace("http://", "https://") : "",
          pages: (v.pageCount as number) || 320,
          lang: ((v.language as string) || "fr").toUpperCase(),
        };
      });
    } catch {
      rs = [];
    }
    if (!rs.length) {
      set({ source: "Open Library (fallback)" });
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?limit=12&q=${encodeURIComponent(q)}`
        );
        const j = await res.json();
        rs = (j.docs || []).map((d: Record<string, unknown>) => ({
          key: d.key as string,
          title: d.title as string,
          author: ((d.author_name as string[]) || ["Auteur inconnu"]).join(", "),
          year: (d.first_publish_year as string) || "—",
          snippet: "Fiche Open Library — résumé à compléter à la main.",
          cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "",
          pages: (d.number_of_pages_median as number) || 320,
          lang: "FR",
        }));
      } catch {
        rs = [];
      }
    }
    set({ results: rs, searching: false });
  },

  addFromApi(r) {
    const i = get().books.length;
    const [bg, ink] = COVER_PALETTE[i % COVER_PALETTE.length];
    const nb: Book = {
      id: `b${i}`, title: r.title, author: r.author, year: r.year,
      genre: "Romance", lang: r.lang, spice: 0, rating: 0, pages: r.pages,
      tropes: [], lists: ["PAL"], resume: r.snippet, comment: "",
      bg, ink, platforms: [{ name: "Kobo", langs: "FR, EN" }],
    };
    set((s) => ({ books: [...s.books, nb], added: [...s.added, r.key], open: nb.id }));
    get().ping(`« ${r.title} » est dans ta PAL. Ajoute le piment et les tropes 🌶`);
  },

  // ── Lists ──
  setNewList: (v) => set({ newList: v }),

  addList() {
    const name = get().newList.trim();
    if (!name) return;
    set((s) => ({
      lists: [...s.lists, { name, dot: "#A99BC1", desc: "" }],
      newList: "",
    }));
  },

  // ── Messages ──
  openConvo: (id) => set({ convo: id }),
  setDraft: (v) => set({ draft: v }),

  sendDraft() {
    const { draft, convo } = get();
    if (!draft.trim()) return;
    set((s) => ({
      convos: s.convos.map((c) =>
        c.id === convo
          ? { ...c, messages: [...c.messages, { from: "me", text: draft.trim() }] }
          : c
      ),
      draft: "",
    }));
  },

  addToMyPal(bookId) {
    set((s) => {
      if (s.pal.includes(bookId)) return s;
      const books = s.books.map((b) =>
        b.id === bookId && !b.lists.includes("PAL")
          ? { ...b, lists: [...b.lists, "PAL"] }
          : b
      );
      return { books, pal: [...s.pal, bookId] };
    });
  },

  // ── Shared reading ──
  setReadBook: (id) => set({ readBook: id }),

  toggleInvite(name) {
    set((s) => ({
      invites: s.invites.includes(name)
        ? s.invites.filter((n) => n !== name)
        : [...s.invites, name],
    }));
  },

  launchRead() {
    const { readBook, invites, books } = get();
    const book = books.find((b) => b.id === readBook);
    if (!book || !invites.length) return;
    const label = invites.length === 1 ? `à deux avec ${invites[0]}` : `à ${invites.length + 1} avec ${invites.join(", ")}`;
    get().ping(`Lecture partagée lancée — ${label} 📖`);
  },

  setPageInput: (v) => set({ pageInput: v }),

  declarePage() {
    const page = parseInt(get().pageInput, 10);
    if (isNaN(page) || page < 0) return;
    const prev = get().myPage;
    set({ myPage: page });
    const unlocked = get().notes.filter((n) => n.page <= page && n.page > prev);
    if (unlocked.length) get().ping(`${unlocked.length} note(s) débloquée(s) 🔓`);
  },

  setNotePage: (v) => set({ notePage: v }),
  setNoteText: (v) => set({ noteText: v }),

  addNote() {
    const { notePage, noteText } = get();
    const page = parseInt(notePage, 10);
    if (isNaN(page) || !noteText.trim()) return;
    const note: SealedNote = { page, who: "Moi", text: noteText.trim(), when: "maintenant" };
    set((s) => ({ notes: [...s.notes, note].sort((a, b) => a.page - b.page), noteText: "" }));
  },

  // ── Toast ──
  ping(msg) {
    const prev = get().toastTimer;
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => set({ toast: "", toastTimer: null }), 2600);
    set({ toast: msg, toastTimer: timer });
  },
}));
