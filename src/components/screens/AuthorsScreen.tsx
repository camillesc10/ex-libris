"use client";
import { useStore } from "@/store";
import type { Book } from "@/types";

interface AuthorGroup {
  author: string;
  books: Book[];
  avgRating: number;
}

export default function AuthorsScreen() {
  const { books, openBook } = useStore();

  const authorMap = new Map<string, Book[]>();
  for (const book of books) {
    const existing = authorMap.get(book.author) ?? [];
    authorMap.set(book.author, [...existing, book]);
  }

  const authors: AuthorGroup[] = Array.from(authorMap.entries())
    .map(([author, bks]) => ({
      author,
      books: bks,
      avgRating:
        bks.filter((b) => b.rating > 0).length > 0
          ? bks.filter((b) => b.rating > 0).reduce((s, b) => s + b.rating, 0) /
            bks.filter((b) => b.rating > 0).length
          : 0,
    }))
    .sort((a, b) => b.books.length - a.books.length);

  return (
    <div
      style={{ padding: "30px 38px" }}
      className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]"
    >
      <h2
        style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)",
          fontWeight: 400,
          fontSize: 20,
          margin: "0 0 24px",
          letterSpacing: ".02em",
        }}
      >
        Auteurs
      </h2>

      {authors.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic" }}>
          Aucun livre dans la bibliothèque.
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 18,
        }}
      >
        {authors.map(({ author, books: bks, avgRating }) => (
          <div
            key={author}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 18,
              background: "var(--surface)",
              padding: 20,
            }}
          >
            {/* Author name */}
            <div
              style={{
                fontFamily: "var(--font-cinzel, Cinzel, serif)",
                fontWeight: 400,
                fontSize: 16,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {author}
            </div>

            {/* Meta row */}
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {bks.length} livre{bks.length > 1 ? "s" : ""}
              </span>
              {avgRating > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {"★".repeat(Math.round(avgRating))}
                  <span style={{ color: "var(--muted)" }}>
                    {avgRating.toFixed(1)}
                  </span>
                </span>
              )}
            </div>

            {/* Mini covers */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {bks.map((b) => (
                <button
                  key={b.id}
                  onClick={() => openBook(b.id)}
                  className="mini-cover"
                  title={b.title}
                  style={{
                    width: 66,
                    height: 98,
                    borderRadius: "3px 8px 8px 3px",
                    background: b.bg,
                    color: b.ink,
                    fontFamily: "var(--font-cinzel, Cinzel, serif)",
                    fontSize: 11,
                    padding: b.coverUrl ? 0 : "8px 6px",
                    textAlign: "left",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "none",
                    borderLeft: "3px solid rgba(224,184,74,.55)",
                    boxShadow: "0 6px 14px -6px #000",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform .15s",
                    position: "relative",
                  }}
                >
                  {b.coverUrl ? (
                    <img src={b.coverUrl} alt={b.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <span style={{ overflow: "hidden", maxHeight: 60, display: "block" }}>{b.title}</span>
                      {b.rating > 0 && <span style={{ fontSize: 8, opacity: 0.8 }}>{"★".repeat(b.rating)}</span>}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
