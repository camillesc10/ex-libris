"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store";

interface ProfileBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  bg: string;
  ink: string;
  series?: string;
  rating: number;
  lists: string[];
}

interface Profile {
  id: string;
  name: string;
  booksRead: number;
  booksTotal: number;
  avgRating: number;
  books: ProfileBook[];
}

function avatarColor(name: string): string {
  const palette = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2", "#9333EA", "#0D9488"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xff;
  return palette[h % palette.length];
}

function starRating(rating: number): string {
  const r = Math.max(0, Math.min(5, rating));
  return "★".repeat(r) + "☆".repeat(5 - r);
}

export default function ProfileScreen() {
  const { profileUserId, navigate } = useStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileUserId) return;
    setLoading(true);
    setError("");
    fetch(`/api/users/${profileUserId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Introuvable");
        return r.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setError("Impossible de charger ce profil."))
      .finally(() => setLoading(false));
  }, [profileUserId]);

  const initial = (profile?.name ?? "?").charAt(0).toUpperCase();
  const color = profile ? avatarColor(profile.name ?? "") : "var(--accent)";

  return (
    <div style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      {/* Header */}
      <div style={{
        padding: "52px 20px 16px",
        borderBottom: "1px solid var(--line)",
        background: "var(--bg)",
      }}>
        <button
          onClick={() => navigate("activity")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 13, padding: 0,
            display: "flex", alignItems: "center", gap: 6, marginBottom: 20,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour
        </button>

        {loading && (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
        )}
        {error && (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>{error}</div>
        )}

        {profile && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 22, flexShrink: 0,
            }}>
              {initial}
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-cinzel, Cinzel, serif)",
                fontSize: 18, letterSpacing: ".02em",
              }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                {profile.booksTotal} livre{profile.booksTotal !== 1 ? "s" : ""} dans sa bibliothèque
              </div>
            </div>
          </div>
        )}
      </div>

      {profile && (
        <div style={{ padding: "20px 20px 0" }}>
          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10, marginBottom: 28,
          }}>
            {[
              { value: String(profile.booksRead), label: "livres lus" },
              { value: profile.avgRating > 0 ? `${profile.avgRating}` : "—", label: "note moyenne" },
              { value: String(profile.booksTotal - profile.booksRead), label: "en attente" },
            ].map(({ value, label }) => (
              <div key={label} style={{
                border: "1px solid var(--line)", borderRadius: 14,
                background: "var(--surface)", padding: "14px 10px", textAlign: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>
                  {value}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Books already read */}
          {profile.booksRead > 0 && (
            <Section title="Déjà lus" books={profile.books.filter((b) => (b.lists as string[]).includes("Déjà lu"))} />
          )}

          {/* Currently reading */}
          {profile.books.some((b) => (b.lists as string[]).includes("En cours")) && (
            <Section title="En cours" books={profile.books.filter((b) => (b.lists as string[]).includes("En cours"))} />
          )}

          {/* PAL */}
          {profile.books.some((b) => (b.lists as string[]).includes("PAL")) && (
            <Section title="PAL" books={profile.books.filter((b) => (b.lists as string[]).includes("PAL"))} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, books }: { title: string; books: ProfileBook[] }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
        color: "var(--muted)", marginBottom: 12,
      }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {books.map((b) => (
          <div key={b.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            border: "1px solid var(--line)", borderRadius: 12,
            background: "var(--surface)", padding: "10px 14px",
          }}>
            {/* Cover */}
            <div style={{
              width: 32, height: 48, borderRadius: 4, flexShrink: 0,
              background: b.bg, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {b.coverUrl ? (
                <img src={b.coverUrl} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {b.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{b.author}</div>
            </div>
            {/* Rating */}
            {(b.rating ?? 0) > 0 && (
              <div style={{ fontSize: 11, color: "var(--accent)", flexShrink: 0 }}>
                {starRating(b.rating)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
