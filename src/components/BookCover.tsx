"use client";
import type { Book } from "@/types";

interface Props {
  book: Book;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

export default function BookCover({ book, width = 132, height = 196, className = "", onClick }: Props) {
  const spiceStr = "🌶".repeat(book.spice) || "";
  const inCours = book.lists.includes("En cours");
  const isReread = book.lists.includes("À relire") && book.rating > 0;
  const progress = book.pages > 0 ? Math.round((book.page / book.pages) * 100) : 0;

  const stateLabel = inCours
    ? `${progress}%`
    : book.lists.includes("Déjà lu")
      ? "Déjà lu"
      : book.lists.includes("PAL")
        ? "PAL"
        : book.lists.includes("En pause")
          ? "En pause"
          : book.lists.includes("À relire")
            ? "À relire"
            : book.lists.includes("Abandonné")
              ? "Abandonné"
              : "";

  const pageLabel = inCours && book.pages > 0
    ? `p. ${book.page} / ${book.pages}`
    : book.pages > 0
      ? `${book.pages} p.`
      : "";

  return (
    <button
      onClick={onClick}
      className={`book-card ${className}`}
      style={{ width, textAlign: "left", transition: "transform .18s ease", background: "none" }}
    >
      <div
        style={{
          height, borderRadius: "4px 12px 12px 4px",
          boxShadow: "0 18px 30px -16px #000",
          background: book.bg,
          borderLeft: "4px solid rgba(224,184,74,.7)",
          outline: "1px solid rgba(224,184,74,.32)", outlineOffset: -6,
          position: "relative", overflow: "hidden",
          ...(book.coverUrl ? {
            backgroundImage: `url(${book.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          } : {
            color: book.ink,
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
          }),
        }}
      >
        {/* Relu badge */}
        {isReread && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            fontSize: 10, fontWeight: 700, letterSpacing: ".08em",
            background: "rgba(224,184,74,.85)", color: "#161C2F",
            borderRadius: 6, padding: "2px 6px",
            textTransform: "uppercase",
          }}>
            relu
          </div>
        )}

        {/* Reading progress bar */}
        {inCours && book.pages > 0 && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
            background: "rgba(0,0,0,.3)",
          }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "rgba(224,184,74,.8)", transition: "width .3s",
            }} />
          </div>
        )}

        {!book.coverUrl && (
          <>
            <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 15, lineHeight: 1.2, letterSpacing: ".02em" }}>
              {book.title}
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.72, marginBottom: 7 }}>
                {book.author}
              </div>
              <div style={{ fontSize: 11 }}>{spiceStr}</div>
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, fontSize: 11.5, color: "var(--muted)" }}>
        <span>{pageLabel}</span>
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>{stateLabel}</span>
      </div>
    </button>
  );
}
