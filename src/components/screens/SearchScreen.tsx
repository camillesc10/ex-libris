"use client";
import { useStore } from "@/store";
import type { SearchResult } from "@/types";
import { COVER_PALETTE } from "@/store/data";

export default function SearchScreen() {
  const { results, searching, source, added, addFromApi, books } = useStore();

  const statusText = searching
    ? "Recherche en cours…"
    : results.length
    ? `${results.length} résultats — clique pour ajouter et compléter la fiche`
    : "Saisis un titre ou un auteur dans la barre de recherche.";

  return (
    <div style={{ padding: "30px 38px", maxWidth: 1100 }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, fontSize: 13, color: "var(--muted)" }}>
        <span style={{ padding: "5px 11px", borderRadius: 999, background: "var(--surface2)" }}>
          {source || "Google Books"}
        </span>
        <span>{statusText}</span>
      </div>

      {searching && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 300, height: 154, borderRadius: 16, border: "1px solid var(--line)",
                background: "var(--surface)", opacity: 0.5,
              }}
            />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {results.map((r, i) => {
          const isAdded = added.includes(r.key);
          const [bg, ink] = COVER_PALETTE[i % COVER_PALETTE.length];
          const coverStyle: React.CSSProperties = {
            position: "relative", width: 82, flexShrink: 0, height: 122,
            borderRadius: "3px 8px 8px 3px", overflow: "hidden",
            backgroundColor: bg,
            ...(r.cover ? { backgroundImage: `url(${r.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
            color: ink, display: "flex", alignItems: "flex-end",
            padding: 10, fontFamily: "var(--font-cinzel, Cinzel, serif)",
            fontSize: 12, lineHeight: 1.15,
          };
          return (
            <div
              key={r.key}
              style={{
                display: "flex", gap: 16, padding: 16,
                border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)",
              }}
            >
              <div style={coverStyle}>{!r.cover && r.title}</div>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 17, lineHeight: 1.2, marginBottom: 4 }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
                  {r.author} · {r.year}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--muted)", flex: 1, overflow: "hidden" }}>
                  {r.snippet}
                </div>
                <button
                  onClick={() => !isAdded && addFromApi(r)}
                  style={{
                    marginTop: 12, alignSelf: "flex-start", padding: "8px 13px",
                    borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                    background: isAdded ? "var(--surface2)" : "var(--soft)",
                    color: isAdded ? "var(--muted)" : "var(--accent)",
                    transition: "all .12s",
                    cursor: isAdded ? "default" : "pointer",
                  }}
                >
                  {isAdded ? "Ajouté ✓" : "Ajouter à ma bibliothèque"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
