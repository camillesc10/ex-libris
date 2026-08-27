"use client";
import { create } from "zustand";
import type {
  Theme, Layout, Flow, Screen,
  Book, BookList, SearchResult,
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
  SEED_BOOKS, SEED_LISTS,
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
  profileUserId: string | null;
  currentUserId: string | null;

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
  advFilters: { minRating: number; minPages: number; maxPages: number; lang: string; year: string; platform: string };
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


  // Persistence
  hydrated: boolean;
  hydrate: () => Promise<void>;

  // UI
  toast: string;
  toastTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  submitAuth: () => Promise<void>;
  toggleAuth: () => void;
  setFormField: (k: "name" | "email" | "pass", v: string) => void;
  logout: () => void;

  setTheme: (t: Theme) => void;
  setLayout: (l: Layout) => void;
  setFlow: (f: Flow) => void;
  dismissTip: () => void;

  navigate: (s: Screen) => void;
  viewProfile: (id: string) => void;
  setListFilter: (name: string | null) => void;
  openBook: (id: string | null) => void;

  patchBook: (id: string, fn: (b: Book) => Book) => void;
  deleteBook: (id: string) => void;
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

  setQuery: (q: string) => void;
  runSearch: () => Promise<void>;
  addFromApi: (r: SearchResult) => void;

  addList: () => void;
  deleteList: (name: string) => void;
  setNewList: (v: string) => void;
  generateShareCode: (listName: string) => void;

  addJournalEntry: (e: Omit<JournalEntry, "id" | "date">) => void;


  ping: (msg: string) => void;
  restoreSession: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  auth: false,
  mode: "login",
  form: { name: "", email: "", pass: "" },
  authError: "",
  user: "",

  theme: "constelle",
  layout: "colonnes",
  flow: "fil",
  showTip: true,

  screen: "shelf",
  listFilter: null,
  open: null,
  profileUserId: null,
  currentUserId: null,

  books: SEED_BOOKS.map((b) => ({ ...b })),
  lists: SEED_LISTS.map((l) => ({ ...l })),
  newList: "",

  genre: "Tous",
  maxSpice: 5,
  librarySearch: "",
  tropeFilter: null,
  shelfSort: "default",
  advFilters: { minRating: 0, minPages: 0, maxPages: 9999, lang: "", year: "", platform: "" },
  palWaveSize: 0,

  shelfColors: {},
  yearGoal: 0,

  journalEntries: [],

  query: "",
  results: [],
  searching: false,
  source: "",
  added: [],


  hydrated: false,

  toast: "",
  toastTimer: null,

  // ── Auth ──
  async submitAuth() {
    const { form, mode } = get();
    if (!/.+@.+\..+/.test(form.email)) {
      set({ authError: "Il manque un e-mail valide." });
      return;
    }
    if (form.pass.length < 4) {
      set({ authError: "Mot de passe : 4 caractères minimum." });
      return;
    }
    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, name: form.name, password: form.pass }),
        });
        if (!res.ok) {
          const data = await res.json();
          set({ authError: data.error || "Erreur à l'inscription." });
          return;
        }
        set({ auth: true, authError: "", user: form.name || "Lectrice", hydrated: false, books: [], lists: [], journalEntries: [] });
        get().hydrate();
      } else {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.pass }),
        });
        if (!res.ok) {
          const data = await res.json();
          set({ authError: data.error || "Identifiants incorrects." });
          return;
        }
        const data = await res.json();
        set({ auth: true, authError: "", user: data.name || "Lectrice", hydrated: false, books: [], lists: [], journalEntries: [] });
        get().hydrate();
      }
    } catch {
      set({ authError: "Erreur réseau — réessaie." });
    }
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
  viewProfile(id) {
    if (id && id === get().currentUserId) {
      set({ screen: "me" });
      return;
    }
    set({ profileUserId: id, screen: "profile" });
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
      const [br, lr, jr, pr, mr] = await Promise.all([
        fetch("/api/books"), fetch("/api/lists"),
        fetch("/api/journal"), fetch("/api/prefs"),
        fetch("/api/me"),
      ]);
      const [booksData, listsData, journalData, prefsData, meData] = await Promise.all([
        br.json(), lr.json(), jr.json(), pr.json(), mr.ok ? mr.json() : Promise.resolve(null),
      ]);
      set({
        books: booksData, lists: listsData,
        journalEntries: journalData,
        shelfColors: prefsData.shelfColors ?? {},
        yearGoal: prefsData.yearGoal ?? 0,
        currentUserId: meData?.id ?? null,
        user: meData?.name ?? get().user,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  // ── Library ──
  patchBook(id, fn) {
    const current = get().books.find((b) => b.id === id);
    if (!current) return;
    const updated = fn(current);
    set((s) => ({ books: s.books.map((b) => (b.id === id ? updated : b)) }));
    fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).then(async (r) => {
      if (!r.ok) console.error(`[patchBook] PATCH /api/books/${id} ${r.status}:`, await r.text());
    }).catch((e) => console.error("[patchBook] réseau:", e));
  },

  deleteBook(id) {
    set((s) => ({ books: s.books.filter((b) => b.id !== id), open: s.open === id ? null : s.open }));
    fetch(`/api/books/${id}`, { method: "DELETE" })
      .then(async (r) => {
        if (!r.ok) console.error(`[deleteBook] DELETE /api/books/${id} ${r.status}:`, await r.text());
      })
      .catch(console.error);
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
  setShelfColor: (shelf, color) => {
    const shelfColors = { ...get().shelfColors, [shelf]: color };
    set({ shelfColors });
    fetch("/api/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shelfColors }) }).catch(() => {});
  },
  setYearGoal: (n) => {
    set({ yearGoal: n });
    fetch("/api/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ yearGoal: n }) }).catch(() => {});
  },

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
        genres: [], lang: "FR",
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
    set({ screen: "search", searching: true, results: [], source: "" });

    // 1. Recherche dans la bibliothèque personnelle d'abord
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const nq = norm(q);
    const libraryHits = get().books.filter(
      (b) => norm(b.title).includes(nq) || norm(b.author).includes(nq)
    );
    if (libraryHits.length > 0) {
      const rs: SearchResult[] = libraryHits.map((b) => ({
        key: b.id,
        title: b.title,
        author: b.author,
        year: b.year,
        snippet: b.resume ?? "",
        cover: b.coverUrl ?? "",
        pages: b.pages,
        lang: b.lang,
        inLibrary: true,
      }));
      set({ results: rs, searching: false, source: "bibliothèque" });
      return;
    }

    // 2. Fallback : sources externes
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
      const j = await res.json();
      const SOURCE_LABELS: Record<string, string> = { hardcover: "Hardcover", openlibrary: "Open Library", google: "Google Books", bnf: "BnF", inventaire: "inventaire.io" };
      const source = SOURCE_LABELS[j.source ?? ""] ?? j.source ?? "";
      const rs: SearchResult[] = (j.items || []).map((it: { id: string; title: string; author: string; year: string; snippet: string; cover: string | null; pages: number; lang: string; isbn?: string; releaseDate?: string }) => ({
        key: it.id,
        title: it.title || "Sans titre",
        author: it.author || "Auteur inconnu",
        year: it.year || "—",
        snippet: it.snippet ? it.snippet.slice(0, 180) + "…" : "Fiche Open Library — résumé à compléter.",
        cover: it.cover ?? "",
        pages: it.pages || 320,
        lang: it.lang || "FR",
        isbn: it.isbn ?? undefined,
        releaseDate: it.releaseDate,
      }));
      set({ results: rs, searching: false, source });
    } catch {
      set({ results: [], searching: false, source: "" });
    }
  },

  addFromApi(r) {
    const norm = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const existing = get().books.find(
      (b) => norm(b.title) === norm(r.title) && norm(b.author) === norm(r.author)
    );
    if (existing) {
      get().openBook(existing.id);
      get().ping(`« ${r.title} » est déjà dans ta bibliothèque.`);
      return;
    }
    const i = get().books.length;
    const [bg, ink] = COVER_PALETTE[i % COVER_PALETTE.length];
    const nb: Book = {
      id: crypto.randomUUID(), title: r.title, author: r.author, year: r.year,
      genres: [], lang: r.lang, spice: 0, rating: 0, pages: r.pages, page: 0,
      tropes: [], lists: ["PAL"], resume: r.snippet, comment: "",
      bg, ink, platforms: [{ name: "Kobo", langs: "FR, EN" }],
      ...(r.cover ? { coverUrl: r.cover } : {}),
      ...(r.releaseDate ? { releaseDate: r.releaseDate } : {}),
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
    fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
    const book = get().books.find((b) => b.id === bookId);
    if (book) get().updatePage(bookId, book.page + pagesRead);
  },

  // ── Lists ──
  setNewList: (v) => set({ newList: v }),

  deleteList(name) {
    const affected = get().books.filter((b) => b.lists.includes(name));
    set((s) => ({
      lists: s.lists.filter((l) => l.name !== name),
      books: s.books.map((b) => ({ ...b, lists: b.lists.filter((n) => n !== name) })),
      listFilter: s.listFilter === name ? null : s.listFilter,
    }));
    fetch(`/api/lists/${encodeURIComponent(name)}`, { method: "DELETE" }).catch(() => {});
    affected.forEach((b) => get().patchBook(b.id, (bk) => ({ ...bk, lists: bk.lists.filter((n) => n !== name) })));
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

  // ── Toast ──
  ping(msg) {
    const prev = get().toastTimer;
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => set({ toast: "", toastTimer: null }), 2600);
    set({ toast: msg, toastTimer: timer });
  },

  async restoreSession() {
    if (get().auth) return;
    const res = await fetch("/api/me");
    if (!res.ok) return;
    const me = await res.json();
    if (me?.id) {
      set({ auth: true, user: me.name ?? "Lectrice" });
      get().hydrate();
    }
  },
}));
