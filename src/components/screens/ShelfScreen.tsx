"use client";
import { useState, useRef } from "react";
import { useStore } from "@/store";
import { TROPES } from "@/store/data";
import BookCover from "../BookCover";
import type { Book } from "@/types";

const STATUS_TILES = [
  { key: "En cours", label: "En cours" },
  { key: "PAL", label: "Ma PAL" },
  { key: "Déjà lu", label: "Déjà lu" },
  { key: "En pause", label: "En pause" },
] as const;

const SYSTEM_STATUSES = new Set(["En cours", "PAL", "Déjà lu", "En pause"]);

const SHELF_ORDER = [
  { key: "En cours", label: "En cours de lecture", meta: "marque-pages en service" },
  { key: "PAL", label: "Pile à lire", meta: "les prochains sur la liste" },
  { key: "Déjà lu", label: "Déjà lu", meta: "terminés, notés" },
  { key: "En pause", label: "En pause", meta: "interrompus, mais pas abandonnés" },
  { key: "À relire", label: "À relire", meta: "trop bons pour une seule lecture" },
  { key: "Abandonné", label: "Abandonné", meta: "la vie est trop courte" },
  { key: "Liste de souhaits", label: "Liste de souhaits", meta: "à acheter" },
];

const SORT_OPTIONS: { value: "default" | "rating" | "pages" | "date" | "alpha"; label: string }[] = [
  { value: "default", label: "Ordre d'ajout" },
  { value: "rating", label: "Note (↓)" },
  { value: "pages", label: "Pages (↑)" },
  { value: "date", label: "Date de lecture" },
  { value: "alpha", label: "Titre A–Z" },
];

function sortBooks(bks: Book[], mode: AppState["shelfSort"]): Book[] {
  const sorted = [...bks];
  switch (mode) {
    case "rating": return sorted.sort((a, b) => b.rating - a.rating);
    case "pages": return sorted.sort((a, b) => (a.pages || 0) - (b.pages || 0));
    case "date": return sorted.sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));
    case "alpha": return sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    default: return sorted;
  }
}

interface AppState {
  shelfSort: "default" | "rating" | "pages" | "date" | "alpha";
}

const SHELF_COLORS = ["#8B6914", "#5C4A1E", "#6B3A2A", "#2D4A3E", "#3A3A5C", "#1A1A1A", "#7D4E57", "#4A6741"];

export default function ShelfScreen() {
  const {
    books, lists, genre, maxSpice, listFilter, librarySearch, tropeFilter,
    shelfSort, advFilters, palWaveSize, shelfColors,
    setGenre, setMaxSpice, setLibrarySearch, setTropeFilter,
    setShelfSort, setAdvFilters, setPalWaveSize, setShelfColor, setListFilter,
    openBook, navigate,
  } = useStore();

  const [showAdv, setShowAdv] = useState(false);
  const [palPage, setPalPage] = useState(0);
  const [showUnrated, setShowUnrated] = useState(false);
  const [parallelTab, setParallelTab] = useState(0);
  const [dragOrder, setDragOrder] = useState<Record<string, string[]>>({});
  const dragSrc = useRef<string | null>(null);

  const filtered = books.filter((b) => {
    if (listFilter && !b.lists.includes(listFilter)) return false;
    if (genre !== "Tous" && b.genre !== genre) return false;
    if (b.spice > maxSpice) return false;
    if (tropeFilter && !b.tropes.includes(tropeFilter)) return false;
    if (librarySearch) {
      const q = librarySearch.toLowerCase();
      if (
        !b.title.toLowerCase().includes(q) &&
        !b.author.toLowerCase().includes(q) &&
        !b.tropes.some((t) => t.toLowerCase().includes(q))
      ) return false;
    }
    if (showUnrated && b.rating > 0) return false;
    if (advFilters.minRating > 0 && b.rating < advFilters.minRating) return false;
    if (advFilters.minPages > 0 && (b.pages || 0) < advFilters.minPages) return false;
    if (advFilters.maxPages < 9999 && (b.pages || 0) > advFilters.maxPages) return false;
    if (advFilters.lang && b.lang !== advFilters.lang) return false;
    if (advFilters.year && b.finishedAt && !b.finishedAt.startsWith(advFilters.year)) return false;
    return true;
  });

  const genresPresent = ["Tous", ...Array.from(new Set(books.map((b) => b.genre)))];
  const tropesPresent = Array.from(new Set(books.flatMap((b) => b.tropes))).slice(0, 12);
  const langsPresent = Array.from(new Set(books.map((b) => b.lang).filter(Boolean)));
  void TROPES;

  function groupBySeries(bks: Book[]) {
    const groups: Array<{ isSaga: boolean; series?: string; books: Book[] }> = [];
    const used = new Set<string>();
    for (const b of bks) {
      if (used.has(b.id)) continue;
      if (b.series) {
        const tomes = bks.filter((x) => x.series === b.series).sort((a, b) => (a.seriesNum || 0) - (b.seriesNum || 0));
        tomes.forEach((t) => used.add(t.id));
        groups.push({ isSaga: true, series: b.series, books: tomes });
      } else {
        used.add(b.id);
        groups.push({ isSaga: false, books: [b] });
      }
    }
    return groups;
  }

  function getOrderedBooks(shelfKey: string, bks: Book[]): Book[] {
    const order = dragOrder[shelfKey];
    if (!order) return sortBooks(bks, shelfSort);
    const map = new Map(bks.map((b) => [b.id, b]));
    const ordered = order.map((id) => map.get(id)).filter(Boolean) as Book[];
    const rest = bks.filter((b) => !order.includes(b.id));
    return [...ordered, ...rest];
  }

  const shelves = listFilter
    ? [{ key: listFilter, label: listFilter, meta: `${filtered.length} livre(s)`, books: filtered }]
    : SHELF_ORDER.map((s) => ({ ...s, books: filtered.filter((b) => b.lists.includes(s.key)) }))
        .filter((s) => s.books.length > 0);

  // Drag & drop handlers (#13/#66)
  function onDragStart(bookId: string) {
    dragSrc.current = bookId;
  }
  function onDrop(shelfKey: string, targetId: string, currentIds: string[]) {
    const srcId = dragSrc.current;
    if (!srcId || srcId === targetId) return;
    const arr = [...currentIds];
    const from = arr.indexOf(srcId);
    const to = arr.indexOf(targetId);
    if (from === -1 || to === -1) return;
    arr.splice(from, 1);
    arr.splice(to, 0, srcId);
    setDragOrder((prev) => ({ ...prev, [shelfKey]: arr }));
    dragSrc.current = null;
  }

  const waveSize = palWaveSize > 0 ? palWaveSize : 0;

  const mobileCollections = lists.filter((l) => !SYSTEM_STATUSES.has(l.name));
  const mobileFiltered = listFilter
    ? books.filter((b) => b.lists.includes(listFilter))
    : books.filter((b) => STATUS_TILES.some((t) => b.lists.includes(t.key)));

  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!p-0">

      {/* ── Mobile layout ── */}
      <div className="hidden max-[820px]:block">
        {/* Sticky header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--line)",
          padding: "52px 16px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h1 style={{
              fontFamily: "var(--font-cinzel, Cinzel, serif)",
              fontWeight: 400, fontSize: 25, letterSpacing: ".02em", margin: 0,
            }}>
              Mon étagère
            </h1>
            <button
              onClick={() => navigate("search")}
              aria-label="Ajouter un livre"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 12,
                background: "var(--accent)", color: "#161C2F",
                fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 15 }}>⊕</span> Ajouter
            </button>
          </div>

          {/* Status tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
            {STATUS_TILES.map((tile) => {
              const count = books.filter((b) => b.lists.includes(tile.key)).length;
              const active = listFilter === tile.key;
              return (
                <button
                  key={tile.key}
                  onClick={() => setListFilter(active ? null : tile.key)}
                  style={{
                    padding: "10px 9px", borderRadius: 12, textAlign: "center",
                    border: active ? "none" : "1px solid var(--line)",
                    background: active ? "var(--accent)" : "var(--surface)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                    color: active ? "#161C2F" : "var(--ink)", lineHeight: 1,
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: 10.5, marginTop: 4, lineHeight: 1.2,
                    color: active ? "rgba(22,28,47,.75)" : "var(--muted)",
                  }}>
                    {tile.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-column book grid */}
        <div style={{ padding: "20px 16px" }}>
          {mobileFiltered.length === 0 ? (
            <div style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", textAlign: "center", marginTop: 40 }}>
              Aucun livre dans cette liste.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px 16px" }}>
              {mobileFiltered.map((book) => {
                const progress = book.pages > 0 ? book.page / book.pages : 0;
                const inProgress = book.lists.includes("En cours") && book.pages > 0;
                return (
                  <button
                    key={book.id}
                    onClick={() => openBook(book.id)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{
                      aspectRatio: "2/3", borderRadius: 6, overflow: "hidden",
                      border: "1px solid rgba(224,184,74,.5)",
                      boxShadow: "0 12px 22px -14px rgba(0,0,0,.85)",
                      position: "relative", background: book.bg,
                    }}>
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", color: book.ink }}>
                          <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 14, lineHeight: 1.25, letterSpacing: ".02em" }}>{book.title}</div>
                          <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.7 }}>{book.author}</div>
                        </div>
                      )}
                      {inProgress && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(0,0,0,.3)" }}>
                          <div style={{ height: "100%", width: `${progress * 100}%`, background: "var(--accent)" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {book.author}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Collections section */}
          {mobileCollections.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400, fontSize: 17, letterSpacing: ".02em", margin: 0 }}>
                  Mes collections
                </h2>
                <button
                  onClick={() => navigate("lists")}
                  style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Gérer
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--surface)" }}>
                {mobileCollections.map((col, i) => {
                  const colBooks = books.filter((b) => b.lists.includes(col.name)).slice(0, 3);
                  const count = books.filter((b) => b.lists.includes(col.name)).length;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setListFilter(col.name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottom: i < mobileCollections.length - 1 ? "1px solid var(--line)" : "none",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: col.dot, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 14, color: "var(--ink)" }}>{col.name}</span>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {colBooks.map((b, j) => (
                          <div
                            key={b.id}
                            style={{
                              width: 22, height: 33, borderRadius: 3,
                              background: b.coverUrl ? undefined : b.bg,
                              border: "1px solid var(--line)",
                              marginLeft: j > 0 ? -8 : 0,
                              overflow: "hidden", flexShrink: 0,
                            }}
                          >
                            {b.coverUrl && <img src={b.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>{count}</span>
                      <span style={{ color: "var(--muted)", fontSize: 14 }}>›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sagas + Par auteur */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20, marginBottom: 16 }}>
            <button
              onClick={() => navigate("series")}
              style={{
                padding: "14px", borderRadius: 14, border: "1px solid var(--line)",
                background: "var(--surface)", fontSize: 13.5, fontWeight: 500,
                color: "var(--ink)", cursor: "pointer",
              }}
            >
              Mes sagas
            </button>
            <button
              onClick={() => navigate("authors")}
              style={{
                padding: "14px", borderRadius: 14, border: "1px solid var(--line)",
                background: "var(--surface)", fontSize: 13.5, fontWeight: 500,
                color: "var(--ink)", cursor: "pointer",
              }}
            >
              Par auteur
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="max-[820px]:hidden" style={{ padding: "30px 38px" }}>
      {/* Search bar */}
      <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={librarySearch}
          onChange={(e) => setLibrarySearch(e.target.value)}
          placeholder="Chercher par titre, auteur ou trope…"
          style={{
            flex: 1, padding: "10px 14px",
            border: "1px solid var(--line)", borderRadius: 12,
            background: "var(--surface)", fontSize: 13.5, outline: "none",
          }}
        />
        {/* Sort dropdown (#23) */}
        <select
          value={shelfSort}
          onChange={(e) => setShelfSort(e.target.value as AppState["shelfSort"])}
          style={{
            padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 12,
            background: "var(--surface)", fontSize: 13, outline: "none", color: "var(--ink)",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {/* Advanced filter toggle (#31) */}
        <button
          onClick={() => setShowAdv((v) => !v)}
          style={{
            padding: "10px 14px", borderRadius: 12, fontSize: 13,
            border: `1px solid ${showAdv ? "var(--accent)" : "var(--line)"}`,
            background: showAdv ? "var(--soft)" : "var(--surface)",
            color: showAdv ? "var(--accent)" : "var(--ink)",
            transition: "all .12s", whiteSpace: "nowrap",
          }}
        >
          Filtres avancés
        </button>
      </div>

      {/* Advanced filter panel (#31) */}
      {showAdv && (
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          padding: "14px 16px", marginBottom: 16,
          border: "1px solid var(--line)", borderRadius: 14, background: "var(--surface)",
        }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Note min
            <select
              value={advFilters.minRating}
              onChange={(e) => setAdvFilters({ minRating: parseInt(e.target.value, 10) })}
              style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface2)", fontSize: 13, color: "var(--ink)" }}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 0 ? "Toutes" : `${n}★`}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Pages min
            <input
              type="number" min={0} value={advFilters.minPages || ""}
              onChange={(e) => setAdvFilters({ minPages: parseInt(e.target.value, 10) || 0 })}
              placeholder="0"
              style={{ width: 80, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface2)", fontSize: 13, color: "var(--ink)" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Pages max
            <input
              type="number" min={0} value={advFilters.maxPages >= 9999 ? "" : advFilters.maxPages}
              onChange={(e) => setAdvFilters({ maxPages: parseInt(e.target.value, 10) || 9999 })}
              placeholder="∞"
              style={{ width: 80, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface2)", fontSize: 13, color: "var(--ink)" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Langue
            <select
              value={advFilters.lang}
              onChange={(e) => setAdvFilters({ lang: e.target.value })}
              style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface2)", fontSize: 13, color: "var(--ink)" }}
            >
              <option value="">Toutes</option>
              {langsPresent.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Année de lecture
            <input
              type="text" value={advFilters.year}
              onChange={(e) => setAdvFilters({ year: e.target.value })}
              placeholder="2025"
              style={{ width: 76, padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface2)", fontSize: 13, color: "var(--ink)" }}
            />
          </label>
          <button
            onClick={() => setAdvFilters({ minRating: 0, minPages: 0, maxPages: 9999, lang: "", year: "" })}
            style={{ fontSize: 12, color: "var(--muted)", marginTop: 16, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "transparent" }}
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Genre + spice filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {genresPresent.map((g) => {
          const active = genre === g;
          return (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 13,
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                background: active ? "var(--soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink)",
                transition: "all .12s",
              }}
            >
              {g}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
          <span>Piment max</span>
          {[0, 1, 2, 3, 4, 5].map((n) => {
            const active = maxSpice === n;
            return (
              <button
                key={n}
                onClick={() => setMaxSpice(n)}
                style={{
                  width: 26, height: 26, borderRadius: 8, fontSize: 12,
                  background: active ? "var(--accent)" : "var(--surface2)",
                  color: active ? "#161C2F" : "var(--ink)",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trope filter chips */}
      {tropesPresent.length > 0 && (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
          {tropesPresent.map((t) => {
            const active = tropeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTropeFilter(t)}
                style={{
                  padding: "5px 11px", borderRadius: 999, fontSize: 12,
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  background: active ? "var(--soft)" : "transparent",
                  color: active ? "var(--accent)" : "var(--muted)",
                  transition: "all .12s",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {/* Unrated filter chip (#101) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setShowUnrated((v) => !v)}
          style={{
            padding: "5px 13px", borderRadius: 999, fontSize: 12,
            border: `1px solid ${showUnrated ? "var(--accent)" : "var(--line)"}`,
            background: showUnrated ? "var(--soft)" : "transparent",
            color: showUnrated ? "var(--accent)" : "var(--muted)",
            transition: "all .12s",
          }}
        >
          Sans note uniquement
        </button>
      </div>

      {/* PAL wave size (#53) + swipe mode (#74) */}
      {!listFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, fontSize: 13, color: "var(--muted)", flexWrap: "wrap" }}>
          <span>Vague PAL&nbsp;:</span>
          {[0, 5, 10, 20].map((n) => (
            <button
              key={n}
              onClick={() => { setPalWaveSize(n); setPalPage(0); }}
              style={{
                padding: "5px 11px", borderRadius: 999, fontSize: 12,
                border: `1px solid ${palWaveSize === n ? "var(--accent)" : "var(--line)"}`,
                background: palWaveSize === n ? "var(--soft)" : "transparent",
                color: palWaveSize === n ? "var(--accent)" : "var(--muted)",
              }}
            >
              {n === 0 ? "Tout" : n}
            </button>
          ))}
        </div>
      )}

      {shelves.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", marginTop: 40, textAlign: "center" }}>
          Aucun livre ne correspond à ces filtres.
        </div>
      )}

      {shelves.map((row) => {
        const isPAL = row.key === "PAL";
        const isEnCours = row.key === "En cours";
        let displayBooks = getOrderedBooks(row.key, row.books);

        // Parallel reading tabs (#75) — "En cours" with multiple books
        const parallelBooks = isEnCours ? displayBooks : [];
        if (isEnCours && parallelBooks.length > 1) {
          const safeTab = Math.min(parallelTab, parallelBooks.length - 1);
          displayBooks = [parallelBooks[safeTab]];
        }

        // PAL wave pagination (#53)
        const totalPAL = displayBooks.length;
        let palStart = 0;
        let palEnd = totalPAL;
        if (isPAL && waveSize > 0) {
          palStart = palPage * waveSize;
          palEnd = Math.min(palStart + waveSize, totalPAL);
          displayBooks = displayBooks.slice(palStart, palEnd);
        }


        const groups = groupBySeries(displayBooks);
        const bookIds = getOrderedBooks(row.key, row.books).map((b) => b.id);

        return (
          <div key={row.key} style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400, fontSize: 20, margin: 0, letterSpacing: ".02em" }}>
                {row.label}
              </h2>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{row.meta}</span>
              {isPAL && waveSize > 0 && (
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {palStart + 1}–{palEnd} / {totalPAL}
                </span>
              )}
              {/* Parallel reading tabs (#75) */}
              {isEnCours && parallelBooks.length > 1 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {parallelBooks.map((b, i) => (
                    <button
                      key={b.id}
                      onClick={() => setParallelTab(i)}
                      style={{
                        padding: "5px 12px", borderRadius: 999, fontSize: 12, minHeight: 30,
                        border: `1px solid ${parallelTab === i ? "var(--accent)" : "var(--line)"}`,
                        background: parallelTab === i ? "var(--soft)" : "transparent",
                        color: parallelTab === i ? "var(--accent)" : "var(--muted)",
                        maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        transition: "all .12s",
                      }}
                    >
                      {b.title}
                    </button>
                  ))}
                </div>
              )}
              {/* Shelf color swatches (#52) */}
              <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
                {SHELF_COLORS.map((c) => (
                  <button
                    key={c}
                    title={c}
                    onClick={() => setShelfColor(row.key, c)}
                    style={{
                      width: 14, height: 14, borderRadius: "50%", background: c,
                      border: shelfColors[row.key] === c ? "2px solid var(--accent)" : "2px solid transparent",
                      outline: shelfColors[row.key] === c ? "1px solid var(--accent)" : "none",
                      outlineOffset: 1,
                      transition: "border-color .12s",
                    }}
                  />
                ))}
                {shelfColors[row.key] && (
                  <button
                    onClick={() => setShelfColor(row.key, "")}
                    style={{ fontSize: 10, color: "var(--muted)", padding: "1px 4px" }}
                    title="Réinitialiser"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex", gap: 22, alignItems: "flex-end",
                overflowX: "auto", paddingBottom: 16,
                borderBottom: `6px solid ${shelfColors[row.key] || "var(--shelf)"}`,
                borderRadius: "0 0 6px 6px",
                boxShadow: `0 8px 0 -4px ${shelfColors[row.key] ? shelfColors[row.key] + "aa" : "rgba(224,184,74,.7)"}, 0 10px 24px -6px rgba(224,184,74,.26), 0 26px 32px -26px #000`,
                minHeight: 220,
              }}
            >
              {groups.map((g, gi) => (
                g.isSaga ? (
                  <div
                    key={`saga-${gi}`}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6, alignItems: "center", flexShrink: 0,
                      border: "1px solid var(--line)", borderRadius: 14,
                      padding: "10px 12px 12px",
                      background: "rgba(255,255,255,.02)",
                    }}
                  >
                    <span style={{
                      fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
                      color: "var(--accent)", maxWidth: 260, textAlign: "center", lineHeight: 1.3,
                    }}>
                      {g.series}
                    </span>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      {g.books.map((b) => (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={() => onDragStart(b.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(row.key, b.id, bookIds)}
                          style={{ cursor: "grab" }}
                        >
                          <BookCover book={b} onClick={() => openBook(b.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    key={g.books[0].id}
                    draggable
                    onDragStart={() => onDragStart(g.books[0].id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(row.key, g.books[0].id, bookIds)}
                    style={{ cursor: "grab", flexShrink: 0, position: "relative" }}
                  >
                    <BookCover book={g.books[0]} onClick={() => openBook(g.books[0].id)} />
                    {row.key === "Liste de souhaits" && (
                      <a
                        href={`https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(`${g.books[0].title} ${g.books[0].author}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute", bottom: 28, left: 0, right: 0,
                          textAlign: "center", fontSize: 10, fontWeight: 700,
                          background: "#E2A900", color: "#1A1200",
                          padding: "3px 0", textDecoration: "none",
                          borderRadius: "0 0 4px 0",
                          letterSpacing: ".04em",
                        }}
                      >
                        Fnac
                      </a>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* PAL pagination controls */}
            {isPAL && waveSize > 0 && totalPAL > waveSize && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <button
                  disabled={palPage === 0}
                  onClick={() => setPalPage((p) => p - 1)}
                  style={{
                    padding: "7px 18px", borderRadius: 10, fontSize: 13,
                    border: "1px solid var(--line)", background: "var(--surface)",
                    color: palPage === 0 ? "var(--muted)" : "var(--ink)",
                  }}
                >
                  ← Précédente
                </button>
                <button
                  disabled={palEnd >= totalPAL}
                  onClick={() => setPalPage((p) => p + 1)}
                  style={{
                    padding: "7px 18px", borderRadius: 10, fontSize: 13,
                    border: "1px solid var(--line)", background: "var(--surface)",
                    color: palEnd >= totalPAL ? "var(--muted)" : "var(--ink)",
                  }}
                >
                  Suivante →
                </button>
              </div>
            )}
          </div>
        );
      })}
      </div>{/* end desktop layout */}
    </div>
  );
}
