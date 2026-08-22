"use client";
import { useStore } from "@/store";
import BookCover from "../BookCover";
import type { Book } from "@/types";

const GENRES_ALL = ["Tous", "Romantasy", "Romance", "Fantasy", "SF", "Thriller", "Contemporain", "Historique", "Dystopie", "Cosy mystery"];

const SHELF_ORDER = [
  { key: "En cours", label: "En cours de lecture", meta: "marque-pages en service" },
  { key: "PAL", label: "Pile à lire", meta: "les prochains sur la liste" },
  { key: "Déjà lu", label: "Déjà lu", meta: "terminés, notés" },
];

export default function ShelfScreen() {
  const { books, lists, genre, maxSpice, listFilter, setGenre, setMaxSpice, openBook } = useStore();

  const filtered = books.filter((b) => {
    if (listFilter && !b.lists.includes(listFilter)) return false;
    if (genre !== "Tous" && b.genre !== genre) return false;
    if (b.spice > maxSpice) return false;
    return true;
  });

  const genresPresent = ["Tous", ...Array.from(new Set(books.map((b) => b.genre)))];

  const shelves = listFilter
    ? [{ key: listFilter, label: listFilter, meta: `${filtered.length} livre(s)`, books: filtered }]
    : SHELF_ORDER.map((s) => ({ ...s, books: filtered.filter((b) => b.lists.includes(s.key)) }))
        .filter((s) => s.books.length > 0);

  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {genresPresent.map((g) => {
          const active = genre === g;
          return (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 13,
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--ink)",
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
                  color: active ? "#fff" : "var(--ink)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {shelves.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", marginTop: 40, textAlign: "center" }}>
          Aucun livre ne correspond à ces filtres.
        </div>
      )}

      {shelves.map((row) => (
        <div key={row.key} style={{ marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontWeight: 400, fontSize: 20, margin: 0 }}>
              {row.label}
            </h2>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{row.meta}</span>
          </div>
          <div
            style={{
              display: "flex", gap: 22, alignItems: "flex-end",
              overflowX: "auto", paddingBottom: 14,
              borderBottom: "9px solid var(--shelf)",
              borderRadius: "0 0 6px 6px",
              boxShadow: "0 14px 22px -18px rgba(51,41,31,.5)",
              minHeight: 210,
            }}
          >
            {row.books.map((b) => (
              <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
