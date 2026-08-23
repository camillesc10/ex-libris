"use client";
import { useState } from "react";
import { useStore } from "@/store";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function TimelineScreen() {
  const { books, openBook } = useStore();

  const currentYear = new Date().getFullYear();

  const finishedBooks = books.filter((b) => !!b.finishedAt);

  const yearsSet = new Set<number>([currentYear]);
  for (const b of finishedBooks) {
    yearsSet.add(new Date(b.finishedAt!).getFullYear());
  }
  const years = Array.from(yearsSet).sort((a, b) => b - a);

  const [year, setYear] = useState<number>(years[0] ?? currentYear);

  const booksThisYear = finishedBooks.filter(
    (b) => new Date(b.finishedAt!).getFullYear() === year
  );

  const totalPages = booksThisYear.reduce((sum, b) => sum + (b.pages || 0), 0);

  function booksForMonth(monthIdx: number) {
    return booksThisYear.filter(
      (b) => new Date(b.finishedAt!).getMonth() === monthIdx
    );
  }

  return (
    <div
      style={{ padding: "30px 38px" }}
      className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]"
    >
      {/* ── Header + year picker ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-cinzel, Cinzel, serif)",
            fontWeight: 400,
            fontSize: 20,
            margin: 0,
            letterSpacing: ".02em",
          }}
        >
          Chronologie
        </h2>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 13,
                border: `1px solid ${y === year ? "var(--accent)" : "var(--line)"}`,
                background: y === year ? "var(--soft)" : "transparent",
                color: y === year ? "var(--accent)" : "var(--ink)",
                transition: "all .12s",
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── Encouragement when empty ── */}
      {booksThisYear.length === 0 && (
        <div
          style={{
            fontSize: 14,
            color: "var(--muted)",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: 60,
          }}
        >
          Aucun livre terminé en {year}. Chaque page compte — continue !
        </div>
      )}

      {/* ── Months grid ── */}
      {booksThisYear.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
            gap: 14,
            marginBottom: 32,
          }}
        >
          {MONTHS.map((month, idx) => {
            const mBooks = booksForMonth(idx);
            return (
              <div
                key={month}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "var(--surface)",
                  padding: "12px 14px",
                  opacity: mBooks.length === 0 ? 0.4 : 1,
                  transition: "opacity .15s",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 10,
                  }}
                >
                  {month}
                </div>

                {mBooks.length === 0 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--line)",
                      fontStyle: "italic",
                    }}
                  >
                    —
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                  >
                    {mBooks.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => openBook(b.id)}
                        className="mini-cover"
                        title={`${b.title} — ${b.author}`}
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
                            <span style={{ overflow: "hidden", maxHeight: 64, display: "block" }}>{b.title}</span>
                            {b.rating > 0 && <span style={{ fontSize: 9, opacity: 0.85 }}>{"★".repeat(b.rating)}</span>}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer stats ── */}
      {booksThisYear.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: 18,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <strong style={{ color: "var(--ink)" }}>{booksThisYear.length}</strong>{" "}
          livre{booksThisYear.length > 1 ? "s" : ""} lu
          {booksThisYear.length > 1 ? "s" : ""} en {year}
          {totalPages > 0 && (
            <>
              {" — "}
              <strong style={{ color: "var(--ink)" }}>
                {totalPages.toLocaleString()}
              </strong>{" "}
              pages
            </>
          )}
        </div>
      )}
    </div>
  );
}
