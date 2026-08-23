"use client";
import { useStore } from "@/store";

const NAV = [
  { key: "shelf" as const, icon: "▤", short: "Étagère" },
  { key: "search" as const, icon: "＋", short: "Ajouter" },
  { key: "lists" as const, icon: "☰", short: "Listes" },
  { key: "club" as const, icon: "⚑", short: "Club" },
  { key: "journal" as const, icon: "✎", short: "Journal" },
];

export default function BottomNav() {
  const { screen, navigate } = useStore();

  return (
    <nav
      className="hidden max-[820px]:flex"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        gap: 4, background: "var(--surface)", borderTop: "1px solid var(--line)",
        padding: "8px 8px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      {NAV.map((n) => {
        const active = screen === n.key;
        return (
          <button
            key={n.key}
            onClick={() => navigate(n.key)}
            style={{
              flex: 1, minHeight: 50, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 13,
              background: active ? "var(--soft)" : "transparent",
              color: active ? "var(--accent)" : "var(--muted)",
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{n.icon}</span>
            <span style={{ fontSize: 10.5, letterSpacing: ".01em" }}>{n.short}</span>
          </button>
        );
      })}
    </nav>
  );
}
