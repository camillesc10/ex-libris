"use client";
import { useStore } from "@/store";
import type { Theme } from "@/types";
import ExLibrisLogo from "./ExLibrisLogo";

const THEMES: { key: Theme; label: string; swatch: string }[] = [
  { key: "constelle", label: "Nuit constellée", swatch: "#252D46" },
  { key: "velin", label: "Vélin", swatch: "#31281F" },
];

export default function Sidebar() {
  const {
    screen, books, lists, theme, user, yearGoal,
    navigate, setListFilter, setTheme, logout, listFilter, setYearGoal,
  } = useStore();

  const currentYear = new Date().getFullYear();
  const readThisYear = books.filter(
    (b) => b.finishedAt && new Date(b.finishedAt).getFullYear() === currentYear
  ).length;
  const goalPct = yearGoal > 0 ? Math.min(100, Math.round((readThisYear / yearGoal) * 100)) : 0;

  const currentBook = books.find((b) => b.lists.includes("En cours"));

  const nav = [
    { key: "shelf" as const, label: "Mon étagère", count: books.length },
    { key: "search" as const, label: "Ajouter un livre", count: "＋" },
    { key: "lists" as const, label: "Mes listes", count: lists.length },
    { key: "series" as const, label: "Mes sagas", count: new Set(books.filter((b) => b.series).map((b) => b.series)).size || "" },
    { key: "authors" as const, label: "Auteurs", count: new Set(books.map((b) => b.author)).size },
    { key: "journal" as const, label: "Journal", count: "" },
    { key: "timeline" as const, label: "Chronologie", count: "" },
    { key: "sync" as const, label: "Lecture partagée", count: "" },
  ];

  return (
    <aside
      className="max-[820px]:!hidden"
      style={{
        borderRight: "1px solid var(--line)", padding: "26px 18px",
        display: "flex", flexDirection: "column", gap: 20,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        background: "color-mix(in srgb, var(--bg) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 8px" }}>
        <ExLibrisLogo variant="lockup" size={30} />
      </div>

      {/* Current book highlight (#56) */}
      {currentBook && (
        <button
          onClick={() => navigate("shelf")}
          style={{
            margin: "0 4px",
            background: "var(--soft)",
            border: "1px solid var(--line)",
            borderLeft: `3px solid ${currentBook.bg}`,
            borderRadius: 10,
            padding: "10px 12px",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>
            En cours
          </div>
          <div style={{ fontSize: 13, fontFamily: "var(--font-cinzel, Cinzel, serif)", lineHeight: 1.3, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {currentBook.title}
          </div>
          {currentBook.pages > 0 && (
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              p. {currentBook.page} / {currentBook.pages}
              <span style={{ marginLeft: 6, color: "var(--accent)" }}>
                {Math.round((currentBook.page / currentBook.pages) * 100)}%
              </span>
            </div>
          )}
        </button>
      )}

      {/* Main nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {nav.map((n) => {
          const active = screen === n.key && !listFilter;
          return (
            <button
              key={n.key}
              onClick={() => navigate(n.key)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 14.5, textAlign: "left",
                background: active ? "var(--soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink)",
                fontWeight: active ? 600 : 400,
                transition: "background .12s",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface2)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span>{n.label}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                {n.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Lists section */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10, padding: "0 12px" }}>
          Mes listes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {lists.map((l) => {
            const active = listFilter === l.name;
            const count = books.filter((b) => b.lists.includes(l.name)).length;
            return (
              <button
                key={l.name}
                onClick={() => setListFilter(l.name)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 9, fontSize: 13.5,
                  background: active ? "var(--soft)" : "transparent",
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface2)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
                  <span style={{ color: active ? "var(--accent)" : "var(--ink)", fontWeight: active ? 600 : 400 }}>{l.name}</span>
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Annual goal (#4) */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 12px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>
              Objectif {currentYear}
            </div>
            <input
              type="number"
              min={0}
              value={yearGoal || ""}
              onChange={(e) => setYearGoal(parseInt(e.target.value, 10) || 0)}
              placeholder="—"
              style={{
                width: 44, padding: "3px 6px", border: "1px solid var(--line)",
                borderRadius: 6, background: "var(--surface2)", fontSize: 12,
                color: "var(--ink)", textAlign: "center", outline: "none",
              }}
            />
          </div>
          {yearGoal > 0 && (
            <div style={{ padding: "0 12px" }}>
              <div style={{ height: 5, borderRadius: 999, background: "var(--line)", overflow: "hidden", marginBottom: 5 }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: `${goalPct}%`,
                  background: goalPct >= 100 ? "#4caf50" : "var(--accent)",
                  transition: "width .4s",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
                <span>{readThisYear} lu{readThisYear > 1 ? "s" : ""}</span>
                <span style={{ color: goalPct >= 100 ? "#4caf50" : "var(--accent)" }}>{goalPct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Theme picker */}
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 9, padding: "0 12px" }}>
            Ambiance
          </div>
          <div style={{ display: "flex", gap: 8, padding: "0 12px" }}>
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                title={t.label}
                style={{
                  width: 26, height: 26, borderRadius: "50%", background: t.swatch,
                  border: `2px solid ${theme === t.key ? "var(--accent)" : "transparent"}`,
                  outline: theme === t.key ? "2px solid var(--accent)" : "none",
                  outlineOffset: 2,
                  transition: "border-color .12s, outline .12s",
                }}
              />
            ))}
          </div>
        </div>

        {/* User card */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "var(--surface2)" }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", background: "var(--accent)",
            color: "#161C2F", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {user[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user}
            </div>
            <button
              onClick={logout}
              style={{ fontSize: 11.5, color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
