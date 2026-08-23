"use client";
import { useStore } from "@/store";
import { TROPES } from "@/store/data";
import BookCover from "../BookCover";

const SHELF_ORDER = [
  { key: "En cours", label: "En cours de lecture", meta: "marque-pages en service" },
  { key: "PAL", label: "Pile à lire", meta: "les prochains sur la liste" },
  { key: "Déjà lu", label: "Déjà lu", meta: "terminés, notés" },
  { key: "En pause", label: "En pause", meta: "interrompus, mais pas abandonnés" },
  { key: "À relire", label: "À relire", meta: "trop bons pour une seule lecture" },
  { key: "Abandonné", label: "Abandonné", meta: "la vie est trop courte" },
];

export default function ShelfScreen() {
  const {
    books, genre, maxSpice, listFilter, librarySearch, tropeFilter,
    setGenre, setMaxSpice, setLibrarySearch, setTropeFilter, openBook,
  } = useStore();

  const filtered = books.filter((b) => {
    if (listFilter && !b.lists.includes(listFilter)) return false;
    if (genre !== "Tous" && b.genre !== genre) return false;
    if (b.spice > maxSpice) return false;
    if (tropeFilter && !b.tropes.includes(tropeFilter)) return false;
    if (librarySearch) {
      const q = librarySearch.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q) && !b.tropes.some((t) => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const genresPresent = ["Tous", ...Array.from(new Set(books.map((b) => b.genre)))];
  const tropesPresent = Array.from(new Set(books.flatMap((b) => b.tropes))).slice(0, 12);
  void TROPES;

  // Group books into saga clusters within each shelf
  function groupBySeries(bks: typeof books) {
    const groups: Array<{ isSaga: boolean; series?: string; books: typeof books }> = [];
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

  const shelves = listFilter
    ? [{ key: listFilter, label: listFilter, meta: `${filtered.length} livre(s)`, books: filtered }]
    : SHELF_ORDER.map((s) => ({ ...s, books: filtered.filter((b) => b.lists.includes(s.key)) }))
        .filter((s) => s.books.length > 0);

  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={librarySearch}
          onChange={(e) => setLibrarySearch(e.target.value)}
          placeholder="Chercher par titre, auteur ou trope…"
          style={{
            width: "100%", maxWidth: 420, padding: "10px 14px",
            border: "1px solid var(--line)", borderRadius: 12,
            background: "var(--surface)", fontSize: 13.5, outline: "none",
          }}
        />
      </div>

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

      {shelves.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", marginTop: 40, textAlign: "center" }}>
          Aucun livre ne correspond à ces filtres.
        </div>
      )}

      {shelves.map((row) => {
        const groups = groupBySeries(row.books);
        return (
          <div key={row.key} style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400, fontSize: 20, margin: 0, letterSpacing: ".02em" }}>
                {row.label}
              </h2>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{row.meta}</span>
            </div>
            <div
              style={{
                display: "flex", gap: 22, alignItems: "flex-end",
                overflowX: "auto", paddingBottom: 16,
                borderBottom: "6px solid var(--shelf)",
                borderRadius: "0 0 6px 6px",
                boxShadow: "0 8px 0 -4px rgba(224,184,74,.7), 0 10px 24px -6px rgba(224,184,74,.26), 0 26px 32px -26px #000",
                minHeight: 220,
              }}
            >
              {groups.map((g, gi) => (
                g.isSaga ? (
                  <div key={`saga-${gi}`} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
                      color: "var(--accent)", maxWidth: 160, textAlign: "center", lineHeight: 1.3,
                    }}>
                      {g.series}
                    </span>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      {g.books.map((b) => (
                        <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <BookCover key={g.books[0].id} book={g.books[0]} onClick={() => openBook(g.books[0].id)} />
                )
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
