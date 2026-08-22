"use client";
import { useStore } from "@/store";

const PAGE_META: Record<string, { kicker: string; title: string }> = {
  shelf: { kicker: "Bibliothèque", title: "Mon étagère" },
  search: { kicker: "Recherche", title: "Ajouter un livre" },
  lists: { kicker: "Organisation", title: "Mes listes" },
  messages: { kicker: "Club de lecture", title: "Messages" },
  sync: { kicker: "Sans spoiler", title: "Lecture partagée" },
};

export default function Header() {
  const { screen, query, setQuery, runSearch } = useStore();
  const meta = PAGE_META[screen] ?? PAGE_META.shelf;

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--line)",
        padding: "18px 38px",
        display: "flex", alignItems: "center", gap: 20,
      }}
      className="max-[820px]:!px-[18px] max-[820px]:!py-[14px] max-[820px]:flex-wrap max-[820px]:gap-3"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>
          {meta.kicker}
        </div>
        <h1 style={{
          fontFamily: "var(--font-newsreader, Newsreader, serif)",
          fontWeight: 400, fontSize: 27, letterSpacing: "-0.02em", margin: "2px 0 0",
        }}>
          {meta.title}
        </h1>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 6px 0 14px", border: "1px solid var(--line)",
          borderRadius: 12, background: "var(--surface)", width: 330,
        }}
        className="max-[820px]:!w-full"
      >
        <span style={{ fontSize: 13, color: "var(--muted)" }}>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Chercher un titre, un auteur…"
          style={{ flex: 1, border: 0, background: "none", padding: "11px 0", fontSize: 14, outline: "none" }}
        />
        <button
          onClick={() => runSearch()}
          style={{
            padding: "7px 12px", borderRadius: 9, background: "var(--soft)",
            color: "var(--accent)", fontSize: 12.5, fontWeight: 600,
          }}
        >
          Chercher
        </button>
      </div>
    </header>
  );
}
