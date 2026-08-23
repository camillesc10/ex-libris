"use client";
import { useStore } from "@/store";
import type { Book } from "@/types";

export default function ClubScreen() {
  const { books, openBook, proposals, voteProposal, proposeBook } = useStore();

  const palBooks = books.filter((b) => b.lists.includes("PAL"));

  const sorted = [...proposals].sort((a, b) => b.votes - a.votes);
  const currentPick = sorted.find((p) => p.votes >= 3) ?? null;
  const currentBook = currentPick ? books.find((b) => b.id === currentPick.bookId) ?? null : null;

  const unproposed = palBooks.filter((b) => !proposals.some((p) => p.bookId === b.id));

  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">

      {/* Heading */}
      <h1 style={{
        fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400,
        fontSize: 26, letterSpacing: ".03em", margin: "0 0 6px",
      }}>
        Club de lecture
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 32px" }}>
        Proposez depuis votre PAL, votez, et lisez ensemble.
      </p>

      {/* ── Current pick ── */}
      <div style={{
        fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 14, fontWeight: 600,
      }}>
        Lecture du moment
      </div>

      {currentBook && currentPick ? (
        <button
          onClick={() => openBook(currentBook.id)}
          style={{
            display: "flex", gap: 22, alignItems: "center",
            background: currentBook.bg, color: currentBook.ink,
            borderRadius: 18, padding: "22px 26px",
            width: "100%", maxWidth: 480, textAlign: "left",
            boxShadow: "0 14px 36px -14px rgba(0,0,0,.65)",
            border: "3px solid rgba(224,184,74,.5)",
            marginBottom: 36, transition: "transform .18s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
        >
          <div style={{
            flexShrink: 0, width: 70, height: 104,
            borderRadius: "3px 10px 10px 3px",
            borderLeft: "4px solid rgba(224,184,74,.7)",
            outline: "1px solid rgba(224,184,74,.28)", outlineOffset: -5,
            background: "rgba(0,0,0,.2)",
            fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 10,
            padding: "8px 7px", lineHeight: 1.22, textAlign: "left",
            display: "flex", alignItems: "flex-start",
          }}>
            {currentBook.title}
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 19,
              lineHeight: 1.2, marginBottom: 6,
            }}>
              {currentBook.title}
            </div>
            <div style={{ fontSize: 12, opacity: 0.72, letterSpacing: ".08em", marginBottom: 12, textTransform: "uppercase" }}>
              {currentBook.author}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, opacity: 0.9,
              background: "rgba(0,0,0,.18)", borderRadius: 8, padding: "4px 10px",
            }}>
              <span>👍</span>
              <span style={{ fontWeight: 700 }}>{currentPick.votes}</span>
              <span style={{ opacity: 0.75 }}>vote{currentPick.votes > 1 ? "s" : ""}</span>
              {currentBook.pages > 0 && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{currentBook.pages} p.</span>
                </>
              )}
            </div>
          </div>
        </button>
      ) : (
        <div style={{
          marginBottom: 36, padding: "18px 22px", borderRadius: 16,
          border: "1px dashed var(--line)", color: "var(--muted)",
          fontSize: 13.5, fontStyle: "italic", maxWidth: 480,
        }}>
          Pas encore de livre retenu — il faut au moins 3 votes pour élire la lecture du club.
        </div>
      )}

      {/* ── Proposals list ── */}
      <div style={{
        fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 14, fontWeight: 600,
      }}>
        Propositions ({proposals.length})
      </div>

      {sorted.length === 0 ? (
        <div style={{
          fontSize: 13.5, color: "var(--muted)", fontStyle: "italic",
          marginBottom: 32,
        }}>
          Aucune proposition pour l&apos;instant. Proposez un livre depuis votre PAL ci-dessous.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {sorted.map((p, rank) => {
            const book = books.find((b) => b.id === p.bookId);
            if (!book) return null;
            const isTop = rank === 0 && p.votes >= 3;
            return (
              <div
                key={p.bookId}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px", borderRadius: 14,
                  border: `1px solid ${isTop ? "rgba(224,184,74,.5)" : "var(--line)"}`,
                  background: isTop ? "var(--soft)" : "var(--surface)",
                  transition: "background .12s",
                }}
              >
                <div style={{
                  flexShrink: 0, width: 24, textAlign: "center",
                  fontSize: 13, color: rank < 3 ? "var(--accent)" : "var(--muted)",
                  fontWeight: rank < 3 ? 700 : 400,
                }}>
                  {rank + 1}
                </div>
                <button
                  onClick={() => openBook(book.id)}
                  title={book.title}
                  style={{
                    flexShrink: 0, width: 46, height: 66,
                    borderRadius: "2px 7px 7px 2px",
                    borderLeft: "3px solid rgba(224,184,74,.7)",
                    background: book.bg, color: book.ink,
                    fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 8.5,
                    padding: book.coverUrl ? 0 : "5px 4px", lineHeight: 1.2, textAlign: "left",
                    boxShadow: "0 6px 14px -8px rgba(0,0,0,.5)",
                    overflow: "hidden", position: "relative",
                  }}
                >
                  {book.coverUrl
                    ? <img src={book.coverUrl} alt={book.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    : book.title}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-cinzel, Cinzel, serif)",
                    fontSize: 14, lineHeight: 1.2, marginBottom: 3,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{book.author}</div>
                </div>
                <button
                  onClick={() => voteProposal(p.bookId)}
                  aria-label={p.votedByMe ? "Retirer mon vote" : "Voter pour ce livre"}
                  style={{
                    flexShrink: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    minWidth: 52, minHeight: 52, padding: "7px 11px",
                    borderRadius: 12,
                    border: `1.5px solid ${p.votedByMe ? "var(--accent)" : "var(--line)"}`,
                    background: p.votedByMe ? "var(--soft)" : "transparent",
                    color: p.votedByMe ? "var(--accent)" : "var(--muted)",
                    fontSize: 20, transition: "all .15s", cursor: "pointer",
                  }}
                >
                  👍
                  <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{p.votes}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Propose from PAL ── */}
      <div style={{
        fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 14, fontWeight: 600,
      }}>
        Proposer depuis ta PAL
      </div>

      {unproposed.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
          {palBooks.length === 0
            ? "Ta PAL est vide — ajoute des livres depuis l'étagère."
            : "Tous tes livres PAL sont déjà proposés au club."}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {unproposed.map((b: Book) => (
            <button
              key={b.id}
              onClick={() => proposeBook(b)}
              style={{
                padding: "10px 16px", borderRadius: 10, minHeight: 44,
                border: "1px solid var(--line)", background: "var(--surface)",
                fontSize: 13, color: "var(--ink)", textAlign: "left",
                transition: "all .12s", cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
              }}
            >
              + {b.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
