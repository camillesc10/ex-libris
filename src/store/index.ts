"use client";
import { create } from "zustand";
import type {
  Theme, Layout, Flow, Screen,
  Book, BookList, Conversation, SealedNote, Reader, SearchResult,
} from "@/types";

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === "," && !inQ) { result.push(cur); cur = ""; }
    else cur += c;
  }
  result.push(cur);
  return result;
}
import {
  SEED_BOOKS, SEED_LISTS, SEED_CONVOS, SEED_NOTES, SEED_READERS,
  COVER_PALETTE,
} from "./data";
import type { JournalEntry } from "@/types";

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
  open: string | null;

  // Library
  books: Book[];
  lists: BookList[];
  newList: string;

  // Filters
  genre: string;
  maxSpice: number;
  librarySearch: string;
  tropeFilter: string | null;
  shelfSort: "default" | "rating" | "pages" | "date" | "alpha";
  advFilters: { minRating: number; minPages: number; maxPages: number; lang: string; year: string };
  palWaveSize: number;

  // Shelf customisation
  shelfColors: Record<string, string>;
  yearGoal: number;

  // Journal
  journalEntries: JournalEntry[];

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
  pal: string[];

  // Shared reading
  readBook: string;
  readers: Reader[];
  invites: string[];
  myPage: number;
  pageInput: string;
  notes: SealedNote[];
  notePage: string;
  noteText: string;

  // Persistence
  hydrated: boolean;
  hydrate: () => Promise<void>;

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
  updatePage: (bookId: string, page: number) => void;

  setGenre: (g: string) => void;
  setMaxSpice: (n: number) => void;
  setLibrarySearch: (q: string) => void;
  setTropeFilter: (t: string | null) => void;
  setShelfSort: (s: AppState["shelfSort"]) => void;
  setAdvFilters: (f: Partial<AppState["advFilters"]>) => void;
  setPalWaveSize: (n: number) => void;
  setShelfColor: (shelf: string, color: string) => void;
  setYearGoal: (n: number) => void;
  importGoodreads: (csv: string) => void;
  importKindle: (txt: string) => void;

  setQuery: (q: string) => void;
  runSearch: () => Promise<void>;
  addFromApi: (r: SearchResult) => void;

  addList: () => void;
  deleteList: (name: string) => void;
  setNewList: (v: string) => void;
  generateShareCode: (listName: string) => void;

  addJournalEntry: (e: Omit<JournalEntry, "id" | "date">) => void;

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

  theme: "constelle",
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
  librarySearch: "",
  tropeFilter: null,
  shelfSort: "default",
  advFilters: { minRating: 0, minPages: 0, maxPages: 9999, lang: "", year: "" },
  palWaveSize: 0,

  shelfColors: {},
  yearGoal: 0,

  journalEntries: [],

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

  hydrated: false,

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

  // ── Persistence ──
  async hydrate() {
    if (get().hydrated) return;
    try {
      const [br, lr] = await Promise.all([fetch("/api/books"), fetch("/api/lists")]);
      const [booksData, listsData] = await Promise.all([br.json(), lr.json()]);
      set({ books: booksData, lists: listsData, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  // ── Library ──
  patchBook(id, fn) {
    set((s) => {
      const updated = s.books.map((b) => (b.id === id ? fn(b) : b));
      const book = updated.find((b) => b.id === id);
      if (book) {
        fetch(`/api/books/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book),
        }).catch(() => {});
      }
      return { books: updated };
    });
  },

  addPlatform(bookId, raw) {
    const [name, langs = ""] = raw.split("·").map((p) => p.trim());
    if (!name) return;
    get().patchBook(bookId, (b) => ({
      ...b,
      platforms: [...b.platforms, { name, langs }],
    }));
  },

  updatePage(bookId, page) {
    get().patchBook(bookId, (b) => {
      const lists = [...b.lists];
      const today = new Date().toISOString().slice(0, 10);
      let { startedAt, finishedAt } = b;
      if (!lists.includes("En cours")) {
        const palIdx = lists.indexOf("PAL");
        if (palIdx !== -1) lists.splice(palIdx, 1);
        lists.push("En cours");
        if (!startedAt) startedAt = today;
      }
      if (page >= b.pages && b.pages > 0) {
        const coursIdx = lists.indexOf("En cours");
        if (coursIdx !== -1) lists.splice(coursIdx, 1);
        if (!lists.includes("Déjà lu")) lists.push("Déjà lu");
        if (!finishedAt) finishedAt = today;
      }
      return { ...b, page, lists, startedAt, finishedAt };
    });
  },

  // ── Filters ──
  setGenre: (g) => set({ genre: g }),
  setMaxSpice: (n) => set((s) => ({ maxSpice: s.maxSpice === n ? 5 : n })),
  setLibrarySearch: (q) => set({ librarySearch: q }),
  setTropeFilter: (t) => set((s) => ({ tropeFilter: s.tropeFilter === t ? null : t })),
  setShelfSort: (s) => set({ shelfSort: s }),
  setAdvFilters: (f) => set((s) => ({ advFilters: { ...s.advFilters, ...f } })),
  setPalWaveSize: (n) => set({ palWaveSize: n }),
  setShelfColor: (shelf, color) => set((s) => ({ shelfColors: { ...s.shelfColors, [shelf]: color } })),
  setYearGoal: (n) => set({ yearGoal: n }),

  importGoodreads(csv) {
    const lines = csv.split("\n").filter(Boolean);
    if (lines.length < 2) return;
    const header = parseCSVRow(lines[0]);
    const col = (name: string) => header.indexOf(name);
    const iTitle = col("Title"), iAuthor = col("Author"), iPages = col("Number of Pages");
    const iRating = col("My Rating"), iShelf = col("Exclusive Shelf");
    const iDateRead = col("Date Read"), iYear = col("Original Publication Year");
    const iISBN = col("ISBN13");
    const existing = get().books;
    let idx = existing.length;
    const newBooks: Book[] = [];
    for (const line of lines.slice(1)) {
      const cols = parseCSVRow(line);
      const title = cols[iTitle]?.trim();
      if (!title) continue;
      if (existing.some((b) => b.title.toLowerCase() === title.toLowerCase())) continue;
      const shelf = cols[iShelf]?.trim() || "to-read";
      const listMap: Record<string, string> = { read: "Déjà lu", reading: "En cours", "to-read": "PAL" };
      const lists = [listMap[shelf] || "PAL"];
      const dateRead = cols[iDateRead]?.trim();
      // Parse series from title like "Title (Series, #N)"
      let cleanTitle = title;
      let series: string | undefined;
      let seriesNum: number | undefined;
      const seriesMatch = title.match(/^(.*?)\s*\(([^,]+),\s*#(\d+)\)$/);
      if (seriesMatch) {
        cleanTitle = seriesMatch[1].trim();
        series = seriesMatch[2].trim();
        seriesNum = parseInt(seriesMatch[3], 10);
      }
      const [bg, ink] = COVER_PALETTE[idx % COVER_PALETTE.length];
      const book: Book = {
        id: `gr${idx}`,
        title: cleanTitle,
        author: cols[iAuthor]?.trim() || "Auteur inconnu",
        year: cols[iYear]?.trim() || "",
        genre: "Roman", lang: "FR",
        spice: 0,
        rating: Math.min(5, parseInt(cols[iRating] || "0", 10) || 0),
        pages: parseInt(cols[iPages] || "0", 10) || 0,
        page: 0,
        tropes: [], lists, resume: "", comment: "",
        bg, ink,
        platforms: cols[iISBN]?.trim() ? [{ name: "ISBN", langs: cols[iISBN].replace(/["=]/g, "").trim() }] : [],
        finishedAt: dateRead || undefined,
        series, seriesNum,
      };
      newBooks.push(book);
      idx++;
    }
    if (!newBooks.length) { get().ping("Aucun nouveau livre trouvé dans ce fichier."); return; }
    set((s) => ({ books: [...s.books, ...newBooks] }));
    newBooks.forEach((b) => {
      fetch("/api/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).catch(() => {});
    });
    get().ping(`${newBooks.length} livre(s) importé(s) depuis Goodreads 📚`);
  },

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
      genre: "Romance", lang: r.lang, spice: 0, rating: 0, pages: r.pages, page: 0,
      tropes: [], lists: ["PAL"], resume: r.snippet, comment: "",
      bg, ink, platforms: [{ name: "Kobo", langs: "FR, EN" }],
    };
    set((s) => ({ books: [...s.books, nb], added: [...s.added, r.key], open: nb.id }));
    fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nb),
    }).catch(() => {});
    get().ping(`« ${r.title} » est dans ta PAL. Ajoute le piment et les tropes 🌶`);
  },

  // ── Journal ──
  addJournalEntry({ bookId, pagesRead, note }) {
    const entry: JournalEntry = {
      id: `j${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      bookId, pagesRead, note,
    };
    set((s) => ({ journalEntries: [entry, ...s.journalEntries] }));
  },

  // ── Kindle import ──
  importKindle(txt) {
    const SEPARATOR = "==========";
    const clips = txt.split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
    const { books } = get();
    let imported = 0;
    const updates: Record<string, typeof books[0]["pageNotes"]> = {};
    for (const clip of clips) {
      const lines = clip.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;
      const titleLine = lines[0];
      const metaLine = lines[1] || "";
      const text = lines.slice(2).join(" ").trim();
      if (!text) continue;
      const pageMatch = metaLine.match(/page\s+(\d+)/i) || metaLine.match(/position\s+(\d+)/i);
      const page = pageMatch ? parseInt(pageMatch[1], 10) : 0;
      const book = books.find((b) => titleLine.toLowerCase().includes(b.title.toLowerCase().slice(0, 12)));
      if (!book) continue;
      if (!updates[book.id]) updates[book.id] = [...(book.pageNotes || [])];
      updates[book.id]!.push({ page, text, date: new Date().toISOString().slice(0, 10) });
      imported++;
    }
    if (!imported) { get().ping("Aucun surlignage reconnu dans ce fichier."); return; }
    Object.entries(updates).forEach(([id, pageNotes]) => {
      get().patchBook(id, (b) => ({ ...b, pageNotes: pageNotes ?? [] }));
    });
    get().ping(`${imported} surlignage(s) Kindle importé(s) 📖`);
  },

  // ── Lists ──
  setNewList: (v) => set({ newList: v }),

  deleteList(name) {
    set((s) => ({
      lists: s.lists.filter((l) => l.name !== name),
      books: s.books.map((b) => ({ ...b, lists: b.lists.filter((n) => n !== name) })),
      listFilter: s.listFilter === name ? null : s.listFilter,
    }));
    fetch(`/api/lists/${encodeURIComponent(name)}`, { method: "DELETE" }).catch(() => {});
  },

  addList() {
    const name = get().newList.trim();
    if (!name) return;
    const entry = { name, dot: "#96A1BE", desc: "" };
    set((s) => ({ lists: [...s.lists, entry], newList: "" }));
    fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
  },

  generateShareCode(listName) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    set((s) => ({ lists: s.lists.map((l) => l.name === listName ? { ...l, shareCode: code } : l) }));
    fetch(`/api/lists/${encodeURIComponent(listName)}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareCode: code }),
    }).catch(() => {});
    get().ping(`Code de partage : ${code}`);
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
