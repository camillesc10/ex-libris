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
import type { JournalEntry, Proposal } from "@/types";

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

  // Club
  proposals: Proposal[];

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
  submitAuth: () => Promise<void>;
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
  importKindle: (txt: string) => void;

  setQuery: (q: string) => void;
  runSearch: () => Promise<void>;
  addFromApi: (r: SearchResult) => void;

  addList: () => void;
  deleteList: (name: string) => void;
  setNewList: (v: string) => void;
  generateShareCode: (listName: string) => void;

  addJournalEntry: (e: Omit<JournalEntry, "id" | "date">) => void;

  voteProposal: (bookId: string) => void;
  proposeBook: (book: import("@/types").Book) => void;

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

  proposals: [],

  query: "",
  results: [],
  searching: false,
  source: "",
  added: [],

  convos: SEED_CONVOS.map((c) => ({ ...c, messages: [...c.messages] })),
  convo: "",
  draft: "",
  pal: [],

  readBook: "",
  readers: SEED_READERS.map((r) => ({ ...r })),
  invites: [],
  myPage: 0,
  pageInput: "",
  notes: [...SEED_NOTES],
  notePage: "",
  noteText: "",

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
        set({ auth: true, authError: "", user: form.name || "Lectrice" });
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
        set({ auth: true, authError: "", user: data.name || "Lectrice" });
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
      const [br, lr, cr, nr, jr, clr, pr] = await Promise.all([
        fetch("/api/books"), fetch("/api/lists"), fetch("/api/conversations"),
        fetch("/api/notes"), fetch("/api/journal"), fetch("/api/club"), fetch("/api/prefs"),
      ]);
      const [booksData, listsData, convosData, notesRaw, journalData, clubData, prefsData] = await Promise.all([
        br.json(), lr.json(), cr.json(), nr.json(), jr.json(), clr.json(), pr.json(),
      ]);
      const notes = (notesRaw as { page: number; who: string; noteText: string; when: string }[]).map(
        (n) => ({ page: n.page, who: n.who, text: n.noteText, when: n.when })
      );
      const firstConvo = convosData[0]?.id ?? "";
      set({
        books: booksData, lists: listsData,
        convos: convosData, convo: firstConvo,
        notes, journalEntries: journalData,
        proposals: clubData,
        shelfColors: prefsData.shelfColors ?? {},
        yearGoal: prefsData.yearGoal ?? 0,
        readBook: prefsData.readBook ?? "",
        myPage: prefsData.myPage ?? 0,
        pageInput: String(prefsData.myPage || ""),
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
    set({ screen: "search", searching: true, results: [], source: "" });
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
      genre: "Romance", lang: r.lang, spice: 0, rating: 0, pages: r.pages, page: 0,
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

  // ── Club ──
  voteProposal(bookId) {
    const updated = get().proposals.map((p) =>
      p.bookId === bookId
        ? { ...p, votes: p.votedByMe ? p.votes - 1 : p.votes + 1, votedByMe: !p.votedByMe }
        : p
    );
    set({ proposals: updated });
    const p = updated.find((p) => p.bookId === bookId);
    if (p) {
      fetch(`/api/club/${bookId}/vote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: p.votes, votedByMe: p.votedByMe }),
      }).catch(() => {});
    }
  },

  proposeBook(book) {
    if (get().proposals.some((p) => p.bookId === book.id)) {
      get().ping("Ce livre est déjà proposé.");
      return;
    }
    const proposal: Proposal = { bookId: book.id, votes: 1, votedByMe: true };
    set((s) => ({ proposals: [...s.proposals, proposal] }));
    fetch("/api/club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    }).catch(() => {});
    get().ping(`« ${book.title} » proposé au club !`);
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

  // ── Messages ──
  openConvo: (id) => set({ convo: id }),
  setDraft: (v) => set({ draft: v }),

  sendDraft() {
    const { draft, convo } = get();
    if (!draft.trim()) return;
    const updated = get().convos.map((c) =>
      c.id === convo
        ? { ...c, messages: [...c.messages, { from: "me" as const, text: draft.trim() }], time: "maintenant" }
        : c
    );
    set({ convos: updated, draft: "" });
    const updatedConvo = updated.find((c) => c.id === convo);
    if (updatedConvo) {
      fetch(`/api/conversations/${convo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedConvo.messages, time: "maintenant" }),
      }).catch(() => {});
    }
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
  setReadBook: (id) => {
    set({ readBook: id });
    fetch("/api/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readBook: id }) }).catch(() => {});
  },

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
    fetch("/api/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ myPage: page }) }).catch(() => {});
    const unlocked = get().notes.filter((n) => n.page <= page && n.page > prev);
    if (unlocked.length) get().ping(`${unlocked.length} note(s) débloquée(s) 🔓`);
  },

  setNotePage: (v) => set({ notePage: v }),
  setNoteText: (v) => set({ noteText: v }),

  addNote() {
    const { notePage, noteText } = get();
    const page = parseInt(notePage, 10);
    if (isNaN(page) || !noteText.trim()) return;
    const id = `n${Date.now()}`;
    const text = noteText.trim();
    const note: SealedNote = { page, who: "Moi", text, when: "maintenant" };
    set((s) => ({ notes: [...s.notes, note].sort((a, b) => a.page - b.page), noteText: "" }));
    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, page, who: "Moi", noteText: text, when: "maintenant" }),
    }).catch(() => {});
  },

  // ── Toast ──
  ping(msg) {
    const prev = get().toastTimer;
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => set({ toast: "", toastTimer: null }), 2600);
    set({ toast: msg, toastTimer: timer });
  },
}));
