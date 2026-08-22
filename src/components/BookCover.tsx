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
  const stars = "★".repeat(book.rating);

  return (
    <button
      onClick={onClick}
      className={`book-card ${className}`}
      style={{ width, textAlign: "left", transition: "transform .18s ease", background: "none" }}
    >
      <div
        style={{
          height, borderRadius: "4px 12px 12px 4px",
          padding: "16px 14px", display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 14px 26px -14px rgba(51,41,31,.45)",
          background: book.bg, color: book.ink,
          borderLeft: "5px solid rgba(0,0,0,.12)",
        }}
      >
        <div style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 16, lineHeight: 1.18, letterSpacing: "-0.01em" }}>
          {book.title}
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.72, marginBottom: 7 }}>
            {book.author}
          </div>
          <div style={{ fontSize: 11 }}>{spiceStr}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, fontSize: 12, color: "var(--muted)" }}>
        <span>{book.genre}</span>
        <span style={{ color: "var(--accent)" }}>{stars}</span>
      </div>
    </button>
  );
}
