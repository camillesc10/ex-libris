"use client";
import { useStore } from "@/store";
import type { Screen } from "@/types";

const TABS: { key: Screen; label: string; screens: Screen[] }[] = [
  { key: "shelf",    label: "Étagère",   screens: ["shelf", "series"] },
  { key: "search",   label: "Recherche", screens: ["search"] },
  { key: "lists",    label: "Listes",    screens: ["lists"] },
  { key: "activity", label: "Activité",  screens: ["activity", "profile"] },
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

function ListsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="8" r="1.5" fill={active ? "currentColor" : "none"} />
      <circle cx="6" cy="12" r="1.5" fill={active ? "currentColor" : "none"} />
      <circle cx="6" cy="16" r="1.5" fill={active ? "currentColor" : "none"} />
      <path d="M10 8 h8 M10 12 h8 M10 16 h8" />
    </svg>
  );
}

function ActivityIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12 h3 l2.5 -5 l3 10 l2.5 -7 l2 4 h3" fill="none" stroke={active ? "var(--accent)" : "currentColor"} />
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
  shelf:    ShelfIcon,
  search:   SearchIcon,
  lists:    ListsIcon,
  activity: ActivityIcon,
  me:       MeIcon,
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
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--line)",
        padding: "10px 12px calc(26px + env(safe-area-inset-bottom))",
        gap: 4,
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
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
