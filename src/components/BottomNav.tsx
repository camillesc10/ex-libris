"use client";
import { useStore } from "@/store";
import type { Screen } from "@/types";

const TABS: { key: Screen; label: string; screens: Screen[] }[] = [
  { key: "shelf",    label: "Étagère",   screens: ["shelf", "series", "lists"] },
  { key: "search",   label: "Recherche", screens: ["search"] },
  { key: "journal",  label: "Journal",   screens: ["journal", "timeline"] },
  { key: "sync",     label: "Ensemble",  screens: ["sync", "activity", "profile"] },
  { key: "me",       label: "Moi",       screens: ["me"] },
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

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="5.5" fill={active ? "currentColor" : "none"} />
      <path d="M15 15 l4.5 4.5" />
    </svg>
  );
}

function JournalIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="13" height="18" rx="2" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <path d="M4 3 h13 a2 2 0 0 1 2 2 v14 a2 2 0 0 1 -2 2 h-13 a2 2 0 0 1 -2 -2 v-14 a2 2 0 0 1 2 -2z" />
      <path d="M8 8 h8 M8 12 h8 M8 16 h5" stroke={active ? "var(--accent)" : "currentColor"} />
      <line x1="4.5" y1="3" x2="4.5" y2="21" strokeWidth="2.5" stroke={active ? "var(--accent)" : "currentColor"} />
    </svg>
  );
}

function SyncIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="5" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <circle cx="15" cy="12" r="5" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <path d="M9 7 a5 5 0 0 1 0 10" stroke={active ? "var(--accent)" : "currentColor"} />
      <path d="M15 7 a5 5 0 0 0 0 10" stroke={active ? "var(--accent)" : "currentColor"} />
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
  shelf:   ShelfIcon,
  search:  SearchIcon,
  journal: JournalIcon,
  sync:    SyncIcon,
  me:      MeIcon,
} as const;

export default function BottomNav() {
  const { screen, open, navigate } = useStore();

  if (open) return null;

  return (
    <nav
      className="hidden max-[820px]:flex"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        alignItems: "stretch",
        background: "color-mix(in srgb, var(--surface) 97%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--line)",
        paddingTop: 8,
        paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        paddingLeft: 4,
        paddingRight: 4,
        gap: 0,
        WebkitTransform: "translate3d(0,0,0)",
        transform: "translate3d(0,0,0)",
        willChange: "transform",
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
              flex: 1, minHeight: 48,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4,
              background: "transparent", border: "none", cursor: "pointer",
              color: active ? "var(--accent)" : "var(--muted)",
            }}
          >
            <Icon active={active} />
            <span style={{ fontSize: 10, letterSpacing: ".02em", fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
