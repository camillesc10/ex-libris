import type { Book } from "@/types";

const SHELF_ORDER = [
  { key: "En cours", label: "En cours de lecture" },
  { key: "Déjà lu", label: "Déjà lu" },
  { key: "PAL", label: "Pile à lire" },
  { key: "En pause", label: "En pause" },
  { key: "À relire", label: "À relire" },
  { key: "Abandonné", label: "Abandonné" },
];

// Inline colours — page has no access to globals.css CSS variables.
const C = {
  bg: "#0B0E1A",
  surface: "#141826",
  surface2: "#1C2235",
  ink: "#E8DFD0",
  muted: "rgba(232,223,208,.48)",
  accent: "#E0B84A",
  line: "rgba(232,223,208,.1)",
} as const;

async function fetchBooks(): Promise<Book[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${base}/api/books`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Book[];
  } catch {
    return [];
  }
}

// id is intentionally unused for now — shows the full shared library.
export default async function EtagerePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js 15.
  void (await params);

  const books = await fetchBooks();

  const shelves = SHELF_ORDER.map((s) => ({
    ...s,
    books: books.filter((b) => b.lists.includes(s.key)),
  })).filter((s) => s.books.length > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: "system-ui, Karla, sans-serif",
        padding: "40px 32px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* ── Header ── */}
      <header style={{ marginBottom: 52 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: ".26em",
            textTransform: "uppercase",
            color: C.accent,
            marginBottom: 10,
          }}
        >
          Ex-Libris
        </div>
        <h1
          style={{
            fontFamily: "Cinzel, Georgia, serif",
            fontWeight: 400,
            fontSize: 30,
            color: C.ink,
            margin: 0,
            letterSpacing: ".04em",
          }}
        >
          Bibliothèque partagée
        </h1>
      </header>

      {/* ── Empty state ── */}
      {books.length === 0 && (
        <p style={{ color: C.muted, fontStyle: "italic" }}>
          Cette bibliothèque est vide pour l&apos;instant.
        </p>
      )}

      {/* ── Shelves ── */}
      {shelves.map((shelf) => (
        <section key={shelf.key} style={{ marginBottom: 52 }}>
          {/* Shelf heading */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <h2
              style={{
                fontFamily: "Cinzel, Georgia, serif",
                fontWeight: 400,
                fontSize: 18,
                color: C.accent,
                margin: 0,
                letterSpacing: ".04em",
              }}
            >
              {shelf.label}
            </h2>
            <span style={{ fontSize: 12, color: C.muted }}>
              {shelf.books.length} livre{shelf.books.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Covers */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {shelf.books.map((b) => (
              <div
                key={b.id}
                title={`${b.title} — ${b.author}${b.rating ? ` · ${"★".repeat(b.rating)}` : ""}`}
                style={{
                  width: 88,
                  height: 130,
                  borderRadius: "4px 12px 12px 4px",
                  background: b.bg,
                  color: b.ink,
                  fontFamily: "Cinzel, Georgia, serif",
                  fontSize: 11,
                  padding: "10px 8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 14px 28px -12px rgba(0,0,0,.8)",
                  borderLeft: "3px solid rgba(224,184,74,.55)",
                  outline: "1px solid rgba(224,184,74,.2)",
                  outlineOffset: -5,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    lineHeight: 1.25,
                    overflow: "hidden",
                    maxHeight: 78,
                    display: "block",
                  }}
                >
                  {b.title}
                </span>
                <span
                  style={{
                    fontSize: 8.5,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    opacity: 0.65,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                >
                  {b.author}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── Footer ── */}
      <footer
        style={{
          marginTop: 64,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 20,
          fontSize: 12,
          color: C.muted,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>Partagé via Ex-Libris</span>
        {books.length > 0 && (
          <span>
            {books.length} livre{books.length > 1 ? "s" : ""} dans la
            collection
          </span>
        )}
      </footer>
    </div>
  );
}
