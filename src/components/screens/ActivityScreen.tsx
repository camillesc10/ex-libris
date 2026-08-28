"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useStore } from "@/store";

interface ActivityEvent {
  id: string;
  userId: string;
  bookId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  userName: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl?: string;
  bookBg: string;
  bookInk: string;
}

interface UserResult {
  id: string;
  name: string;
}

function starRating(rating: number): string {
  const r = Math.max(0, Math.min(5, rating));
  return "★".repeat(r) + "☆".repeat(5 - r);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return `il y a ${Math.floor(days / 7)} sem.`;
}

function avatarColor(name: string): string {
  const palette = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2", "#9333EA", "#0D9488"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xff;
  return palette[h % palette.length];
}

function eventLabel(ev: ActivityEvent): string {
  const t = ev.bookTitle;
  const r = (ev.payload.rating as number) ?? 0;
  switch (ev.type) {
    case "book_added":     return `a ajouté « ${t} » à sa bibliothèque`;
    case "book_finished":  return `a terminé « ${t} »${r > 0 ? ` · ${starRating(r)}` : ""}`;
    case "book_abandoned": return `a abandonné « ${t} »`;
    case "rating_given":   return `a noté « ${t} » · ${starRating(r)}`;
    case "journal_entry": {
      const pages = ev.payload.pagesRead as number;
      return `a lu ${pages} page${pages !== 1 ? "s" : ""} de « ${t} »`;
    }
    default: return `a mis à jour « ${t} »`;
  }
}

const SEARCH_DEBOUNCE = 300;

export default function ActivityScreen() {
  const { viewProfile } = useStore();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // #20 — utilisateurs uniques présents dans le fil
  const uniqueUsers = useMemo(
    () => Array.from(new Set(events.map((e) => e.userName).filter(Boolean))),
    [events]
  );
  const filteredEvents = userFilter ? events.filter((e) => e.userName === userFilter) : events;

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingFeed(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setUserResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => setUserResults(Array.isArray(data) ? data : []))
        .catch(() => setUserResults([]))
        .finally(() => setLoadingSearch(false));
    }, SEARCH_DEBOUNCE);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const isSearching = query.trim().length >= 2;

  return (
    <div style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      {/* Header */}
      <div style={{
        padding: "52px 20px 12px",
        position: "sticky", top: 0, zIndex: 10,
        background: "var(--bg)",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)",
          fontSize: 22, letterSpacing: ".02em", marginBottom: 14,
        }}>
          Activité
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--surface)", borderRadius: 12,
          border: "1px solid var(--line)", padding: "0 14px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un lecteur…"
            style={{
              flex: 1, border: "none", background: "none", padding: "12px 0",
              fontSize: 14, outline: "none", color: "var(--ink)",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, fontSize: 18, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>

        {/* #20 — chips de filtre par lecteur·ice */}
        {!query && uniqueUsers.length > 1 && (
          <div style={{ display: "flex", gap: 7, overflowX: "auto", marginTop: 10, paddingBottom: 2, scrollbarWidth: "none" }}>
            <button
              onClick={() => setUserFilter(null)}
              style={{
                flexShrink: 0, padding: "5px 12px", borderRadius: 999, fontSize: 12,
                border: `1px solid ${userFilter === null ? "var(--accent)" : "var(--line)"}`,
                background: userFilter === null ? "var(--soft)" : "transparent",
                color: userFilter === null ? "var(--accent)" : "var(--muted)",
                cursor: "pointer",
              }}
            >
              Toutes
            </button>
            {uniqueUsers.map((u) => (
              <button
                key={u}
                onClick={() => setUserFilter(userFilter === u ? null : u)}
                style={{
                  flexShrink: 0, padding: "5px 12px", borderRadius: 999, fontSize: 12,
                  border: `1px solid ${userFilter === u ? "var(--accent)" : "var(--line)"}`,
                  background: userFilter === u ? "var(--soft)" : "transparent",
                  color: userFilter === u ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 0 8px" }}>
        {/* User search results */}
        {isSearching && (
          <div>
            {loadingSearch && (
              <div style={{ padding: "24px 20px", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                Recherche…
              </div>
            )}
            {!loadingSearch && userResults.length === 0 && (
              <div style={{ padding: "24px 20px", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                Aucun lecteur trouvé pour « {query.trim()} »
              </div>
            )}
            {!loadingSearch && userResults.map((u) => (
              <button
                key={u.id}
                onClick={() => viewProfile(u.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 20px", width: "100%",
                  borderBottom: "1px solid var(--line)",
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: avatarColor(u.name ?? "?"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {(u.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{u.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Activity feed */}
        {!isSearching && (
          <div>
            {loadingFeed && (
              <div style={{ padding: "40px 20px", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                Chargement…
              </div>
            )}
            {!loadingFeed && events.length === 0 && (
              <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Pas encore d&apos;activité</div>
                <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 260, margin: "0 auto" }}>
                  Les lectures de la communauté apparaîtront ici.
                </div>
              </div>
            )}
            {!loadingFeed && filteredEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: ActivityEvent }) {
  const { viewProfile, currentUserId, openBook, books } = useStore();
  const bookInLibrary = books.find((b) => b.id === ev.bookId);
  const isMe = ev.userId === currentUserId;
  const displayName = isMe ? "Vous" : (ev.userName ?? "?");
  const initial = displayName.charAt(0).toUpperCase();
  const color = avatarColor(ev.userName ?? "?");
  const label = eventLabel(ev);

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "14px 20px",
      borderBottom: "1px solid var(--line)",
    }}>
      {/* Avatar */}
      <button
        onClick={() => viewProfile(ev.userId)}
        style={{
          width: 38, height: 38, borderRadius: "50%",
          background: color, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 15, flexShrink: 0,
          marginTop: 2, border: "none", cursor: "pointer", padding: 0,
        }}
      >
        {initial}
      </button>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.45 }}>
          <button
            onClick={() => viewProfile(ev.userId)}
            style={{ fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, color: isMe ? "var(--accent)" : "var(--ink)", fontSize: 13 }}
          >
            {displayName}
          </button>{" "}
          <span style={{ color: "var(--ink)" }}>{label}</span>
        </div>
        {/* #19 — progression en % pour les entrées journal */}
        {ev.type === "journal_entry" && (() => {
          const page = ev.payload?.page as number | null | undefined;
          const totalPgs = bookInLibrary?.pages;
          if (!page || !totalPgs) return null;
          const pct = Math.min(100, Math.round((page / totalPgs) * 100));
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ flex: 1, maxWidth: 120, height: 3, borderRadius: 2, background: "var(--line)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10.5, color: "var(--accent)", fontWeight: 600 }}>{pct}%</span>
            </div>
          );
        })()}
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
          {timeAgo(ev.createdAt)}
        </div>
      </div>

      {/* Book cover — clickable if in library */}
      <button
        onClick={() => bookInLibrary && openBook(bookInLibrary.id)}
        style={{
          width: 36, height: 54, borderRadius: 5, flexShrink: 0,
          background: ev.bookBg, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", padding: 0,
          cursor: bookInLibrary ? "pointer" : "default",
          boxShadow: bookInLibrary ? "0 0 0 1.5px var(--accent)" : "none",
        }}
      >
        {ev.bookCoverUrl ? (
          <img
            src={ev.bookCoverUrl}
            alt={ev.bookTitle}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 10, color: ev.bookInk, textAlign: "center", padding: "0 3px", lineHeight: 1.2 }}>
            {ev.bookTitle.slice(0, 12)}
          </span>
        )}
      </button>
    </div>
  );
}
