"use client";
import { useRef } from "react";
import { useStore } from "@/store";
import type { Theme } from "@/types";

const THEME_OPTIONS: { value: Theme; label: string; desc: string }[] = [
  { value: "constelle", label: "Nuit constellée", desc: "Fond sombre, or et étoiles" },
  { value: "velin", label: "Vélin", desc: "Fond crème, tons chauds" },
];

const STAT_LINKS = [
  { label: "Mes collections", screen: "lists" as const },
  { label: "Mes sagas", screen: "series" as const },
  { label: "Par auteur", screen: "authors" as const },
];

export default function MeScreen() {
  const {
    user, theme, yearGoal, books, journalEntries,
    setTheme, setYearGoal, navigate, logout, importGoodreads,
  } = useStore();

  const goodreadsRef = useRef<HTMLInputElement>(null);

  const booksRead = books.filter((b) => b.lists.includes("Déjà lu")).length;
  const totalPages = journalEntries.reduce((s, e) => s + e.pagesRead, 0);
  const ratedBooks = books.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length).toFixed(1)
    : "—";
  const seriesInProgress = new Set(
    books.filter((b) => b.lists.includes("En cours") && b.series).map((b) => b.series!)
  ).size;

  const goalProgress = yearGoal > 0 ? Math.min(1, booksRead / yearGoal) : 0;
  const initial = (user || "L").charAt(0).toUpperCase();

  function handleGoodreadsImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      if (csv) importGoodreads(csv);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ padding: "52px 20px calc(100px + env(safe-area-inset-bottom))", maxWidth: 540, margin: "0 auto" }}>
      {/* Avatar + pseudo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--accent)", color: "#161C2F",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 22, fontWeight: 700,
          flexShrink: 0,
        }}>
          {initial}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 18, letterSpacing: ".02em" }}>
            {user || "Lectrice"}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
            {booksRead} livre{booksRead !== 1 ? "s" : ""} lus
          </div>
        </div>
      </div>

      {/* Annual goal */}
      {yearGoal > 0 && (
        <div style={{
          border: "1px solid var(--line)", borderRadius: 16,
          background: "var(--surface)", padding: "16px 18px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)" }}>
              Objectif annuel
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              {booksRead} / {yearGoal}
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${goalProgress * 100}%`, background: "var(--accent)", borderRadius: 3, transition: "width .3s" }} />
          </div>
        </div>
      )}

      {/* Set goal */}
      {yearGoal === 0 && (
        <div style={{
          border: "1px dashed var(--line)", borderRadius: 16,
          padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <input
            type="number" min={1} placeholder="Objectif de livres à lire cette année"
            style={{ flex: 1, border: "none", background: "none", fontSize: 13, outline: "none", color: "var(--ink)" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = parseInt((e.currentTarget as HTMLInputElement).value, 10);
                if (v > 0) setYearGoal(v);
              }
            }}
          />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Entrée pour valider</span>
        </div>
      )}

      {/* 3 stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { value: totalPages.toLocaleString("fr-FR"), label: "pages lues" },
          { value: String(seriesInProgress || "—"), label: seriesInProgress === 1 ? "saga en cours" : "sagas en cours" },
          { value: String(avgRating), label: "note moyenne" },
        ].map(({ value, label }) => (
          <div key={label} style={{
            border: "1px solid var(--line)", borderRadius: 14,
            background: "var(--surface)", padding: "14px 10px", textAlign: "center",
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-.01em" }}>
              {value}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Theme picker */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
          Ambiance
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 12, border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  background: active ? "var(--soft)" : "transparent",
                  textAlign: "left", cursor: "pointer",
                }}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                  background: active ? "var(--accent)" : "var(--line)",
                  border: active ? "none" : "2px solid var(--line)",
                }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: active ? 600 : 400, color: active ? "var(--accent)" : "var(--ink)" }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav links */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", overflow: "hidden", marginBottom: 20 }}>
        {STAT_LINKS.map((link, i) => (
          <button
            key={link.screen}
            onClick={() => navigate(link.screen)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "15px 18px", background: "none", border: "none", cursor: "pointer",
              borderBottom: i < STAT_LINKS.length - 1 ? "1px solid var(--line)" : "none",
              fontSize: 14, color: "var(--ink)", textAlign: "left",
            }}
          >
            {link.label}
            <span style={{ color: "var(--muted)", fontSize: 16 }}>›</span>
          </button>
        ))}
        <button
          onClick={() => goodreadsRef.current?.click()}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "15px 18px", background: "none", border: "none", cursor: "pointer",
            borderTop: "1px solid var(--line)",
            fontSize: 14, color: "var(--ink)", textAlign: "left",
          }}
        >
          Importer Goodreads
          <span style={{ color: "var(--muted)", fontSize: 16 }}>›</span>
        </button>
        <input ref={goodreadsRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleGoodreadsImport} />
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          width: "100%", padding: "14px 18px", borderRadius: 14,
          border: "1px solid var(--line)", background: "transparent",
          color: "var(--muted)", fontSize: 14, cursor: "pointer",
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
