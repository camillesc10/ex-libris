"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { COVER_PALETTE } from "@/store/data";
import GoodreadsImport from "../GoodreadsImport";
import IsbnScanner from "../IsbnScanner";

export default function SearchScreen() {
  const { results, searching, source, added, addFromApi, runSearch, setQuery, query } = useStore();
  const [scanOpen, setScanOpen] = useState(false);
  const [isbnDraft, setIsbnDraft] = useState("");

  async function handleIsbnFound(isbn: string) {
    setScanOpen(false);
    setQuery(isbn);
    await runSearch();
  }

  async function handleIsbnText(isbn: string) {
    setIsbnDraft("");
    setQuery(isbn);
    await runSearch();
  }

  const statusText = searching
    ? "Recherche en cours…"
    : results.length
    ? `${results.length} résultats — clique pour ajouter et compléter la fiche`
    : "Saisis un titre, un auteur ou un ISBN dans la barre de recherche.";

  return (
    <div style={{ padding: "30px 38px", maxWidth: 1100 }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      {/* Title / author search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Titre, auteur…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) runSearch(); }}
          style={{
            flex: 1, minWidth: 220, maxWidth: 500, padding: "11px 16px", minHeight: 46,
            border: "1px solid var(--line)", borderRadius: 12,
            background: "var(--surface)", fontSize: 14, outline: "none", color: "var(--ink)",
          }}
        />
        <button
          onClick={() => { if (query.trim()) runSearch(); }}
          disabled={searching}
          style={{
            padding: "11px 22px", borderRadius: 12, minHeight: 46,
            background: "var(--accent)", color: "#161C2F", fontSize: 14, fontWeight: 700,
            opacity: searching ? 0.7 : 1,
          }}
        >
          {searching ? "…" : "Rechercher"}
        </button>
      </div>

      {/* ISBN scan button + ISBN text field (#99) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <button
          onClick={() => setScanOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, minHeight: 44,
            padding: "9px 16px", borderRadius: 11, fontSize: 13, fontWeight: 600,
            background: "var(--soft)", color: "var(--accent)",
            border: "1px solid var(--line)",
          }}
        >
          <span style={{ fontSize: 16 }}>📷</span> Scanner un ISBN
        </button>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={13}
            placeholder="ISBN (ex. 9782070360024)"
            value={isbnDraft}
            onChange={(e) => setIsbnDraft(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isbnDraft.length >= 10) {
                handleIsbnText(isbnDraft);
              }
            }}
            style={{
              padding: "9px 14px 9px 14px", minHeight: 44,
              border: "1px solid var(--line)", borderRadius: 11,
              background: "var(--surface)", fontSize: 13, outline: "none", width: 220,
              color: "var(--ink)",
            }}
          />
          {isbnDraft.length >= 10 && (
            <button
              onClick={() => handleIsbnText(isbnDraft)}
              style={{
                position: "absolute", right: 8,
                padding: "4px 10px", borderRadius: 7, fontSize: 12,
                background: "var(--accent)", color: "#161C2F", fontWeight: 600,
              }}
            >
              ↵
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
          <span style={{ padding: "5px 11px", borderRadius: 999, background: "var(--surface2)" }}>
            {source || "Google Books"}
          </span>
          <span className="max-[820px]:hidden">{statusText}</span>
        </div>
      </div>

      {/* Goodreads import */}
      <GoodreadsImport />

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

      {scanOpen && <IsbnScanner onFound={handleIsbnFound} onClose={() => setScanOpen(false)} />}
    </div>
  );
}
