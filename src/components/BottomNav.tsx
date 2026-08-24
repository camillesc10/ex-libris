"use client";
import { useStore } from "@/store";
import type { Screen } from "@/types";

const TABS: { key: Screen; label: string; screens: Screen[] }[] = [
  { key: "shelf", label: "Étagère", screens: ["shelf", "search", "lists", "series", "authors"] },
  { key: "sync", label: "Lecture partagée", screens: ["sync"] },
  { key: "journal", label: "Journal", screens: ["journal", "timeline"] },
  { key: "me", label: "Moi", screens: ["me"] },
];

function ShelfIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="5" y="7" width="4" height="10" rx="1" />
      <rect x="10.5" y="4" width="4" height="13" rx="1" />
      <rect x="16" y="9.5" width="3.4" height="7.5" rx="1" />
      <path d="M3.6 19.2 h16.8" fill="none" />
    </svg>
  );
}

function SyncIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M12 7.4 C10.3 6 8 5.6 5 5.9 v10.4 c3-.3 5.3.1 7 1.5" />
      <path d="M12 7.4 C13.7 6 16 5.6 19 5.9 v10.4 c-3-.3-5.3.1-7 1.5" />
      <path d="M12 7.4 v10.4" strokeLinecap="round" />
    </svg>
  );
}

function JournalIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 4.5 h8.6 a2.4 2.4 0 0 1 2.4 2.4 v12.6 h-11 a1.5 1.5 0 0 1 -1.5 -1.5 v-12 a1.5 1.5 0 0 1 1.5 -1.5 z" />
      <path d="M5 17.8 h12.5" fill="none" />
      <path d="M9 8.4 h5.4 M9 11.5 h3.6" fill="none" style={{ stroke: active ? "var(--surface)" : "currentColor" }} />
    </svg>
  );
}

function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="12" cy="8.6" r="3.6" />
      <path d="M5.4 19.4 c1-3.3 3.6-5 6.6-5 s5.6 1.7 6.6 5" />
    </svg>
  );
}

const ICONS = {
  shelf: ShelfIcon,
  sync: SyncIcon,
  journal: JournalIcon,
  me: MeIcon,
} as const;

export default function BottomNav() {
  const { screen, open, navigate } = useStore();

  if (open) return null;

  return (
    <nav
      className="hidden max-[820px]:flex"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "stretch",
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--line)",
        padding: "10px 12px calc(26px + env(safe-area-inset-bottom))",
        gap: 4,
      }}
    >
      {TABS.map((tab) => {
        const active = tab.screens.includes(screen);
        const Icon = ICONS[tab.key as keyof typeof ICONS];
        return (
          <button
            key={tab.key}
            aria-label={tab.label}
            onClick={() => navigate(tab.key)}
            style={{
              flex: 1, minHeight: 50,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
              background: "transparent", border: "none", cursor: "pointer",
              color: active ? "var(--accent)" : "var(--muted)",
              position: "relative",
            }}
          >
            <Icon active={active} />
            {active && (
              <span style={{
                position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                width: 4, height: 4, borderRadius: "50%", background: "var(--accent)",
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
