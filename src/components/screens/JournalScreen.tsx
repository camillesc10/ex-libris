"use client";
import { useState } from "react";
import { useStore } from "@/store";
import type { JournalEntry } from "@/types";

export default function JournalScreen() {
  const { books, journalEntries, addJournalEntry, openBook } = useStore();

  const booksEnCours = books.filter((b) => b.lists.includes("En cours"));

  const [bookId, setBookId] = useState<string>(booksEnCours[0]?.id ?? "");
  const [pages, setPages] = useState("");
  const [note, setNote] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "parLivre">("timeline");

  const totalPages = journalEntries.reduce((sum, e) => sum + e.pagesRead, 0);

  // #17 — regroupement par livre
  const byBook: { book: ReturnType<typeof books.find>; entries: JournalEntry[]; total: number }[] = [];
  if (viewMode === "parLivre") {
    const map = new Map<string, JournalEntry[]>();
    for (const e of journalEntries) {
      const arr = map.get(e.bookId) ?? [];
      arr.push(e);
      map.set(e.bookId, arr);
    }
    for (const [bid, entries] of map) {
      byBook.push({
        book: books.find((b) => b.id === bid),
        entries,
        total: entries.reduce((s, e) => s + e.pagesRead, 0),
      });
    }
    byBook.sort((a, b) => b.total - a.total);
  }

  function handleSubmit() {
    const pagesRead = parseInt(pages, 10);
    if (!bookId || isNaN(pagesRead) || pagesRead <= 0) return;
    addJournalEntry({ bookId, pagesRead, note });
    setPages("");
    setNote("");
  }

  return (
    <div
      style={{ padding: "30px 38px" }}
      className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]"
    >
      {/* Title */}
      <h2
        style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)",
          fontWeight: 400,
          fontSize: 20,
          margin: "0 0 24px",
          letterSpacing: ".02em",
        }}
      >
        Journal de lecture
      </h2>

      {/* Journal feed */}
      <div>

      {/* ── Add-entry form ── */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "var(--surface)",
          padding: 20,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {/* Book selector */}
          <div style={{ flex: "1 1 160px" }}>
            <label
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Livre en cours
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid var(--line)",
                borderRadius: 11,
                background: "var(--surface2)",
                fontSize: 13,
                outline: "none",
              }}
            >
              {booksEnCours.length === 0 && (
                <option value="">Aucun livre en cours</option>
              )}
              {booksEnCours.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Pages read */}
          <div style={{ flex: "0 0 120px" }}>
            <label
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Pages lues
            </label>
            <input
              type="number"
              min={1}
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="ex : 40"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid var(--line)",
                borderRadius: 11,
                background: "var(--surface2)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Free note */}
          <div style={{ flex: "2 1 220px" }}>
            <label
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Note libre
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Pensées du jour…"
              rows={2}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid var(--line)",
                borderRadius: 11,
                background: "var(--surface2)",
                fontSize: 13,
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              background: "var(--accent)",
              color: "#161C2F",
              borderRadius: 11,
              fontWeight: 600,
              padding: "10px 20px",
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              alignSelf: "flex-end",
            }}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* ── Total pages + toggle de vue ── */}
      {journalEntries.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Total pages lues&nbsp;:{" "}
            <strong style={{ color: "var(--ink)" }}>
              {totalPages.toLocaleString()}
            </strong>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {(["timeline", "parLivre"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "5px 13px", borderRadius: 999, fontSize: 12,
                  border: `1px solid ${viewMode === mode ? "var(--accent)" : "var(--line)"}`,
                  background: viewMode === mode ? "var(--soft)" : "transparent",
                  color: viewMode === mode ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                {mode === "timeline" ? "Chronologique" : "Par livre"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {journalEntries.length === 0 && (
        <div
          style={{
            fontSize: 14,
            color: "var(--muted)",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: 48,
          }}
        >
          Aucune entrée dans le journal. Commence ta première session !
        </div>
      )}

      {/* ── Vue par livre (#17) ── */}
      {viewMode === "parLivre" && byBook.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {byBook.map(({ book, entries, total }) => (
            <div
              key={book?.id ?? entries[0].bookId}
              style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", overflow: "hidden" }}
            >
              {/* En-tête du livre */}
              <button
                onClick={() => book && openBook(book.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", background: "none", border: "none",
                  cursor: book ? "pointer" : "default", textAlign: "left",
                }}
              >
                {book && (
                  <div style={{ width: 36, height: 54, borderRadius: "3px 7px 7px 3px", background: book.bg, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 10px -4px rgba(0,0,0,.4)" }}>
                    {book.coverUrl
                      ? <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }}>
                          <span style={{ fontSize: 7, color: book.ink, lineHeight: 1.2, textAlign: "center", fontFamily: "Cinzel, serif" }}>{book.title.slice(0, 10)}</span>
                        </div>
                    }
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 14, color: "var(--ink)", marginBottom: 3 }}>
                    {book?.title ?? "Livre inconnu"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                    {total} page{total !== 1 ? "s" : ""} lues · {entries.length} session{entries.length !== 1 ? "s" : ""}
                    {book?.pages ? ` · ${Math.round((total / book.pages) * 100)}%` : ""}
                  </div>
                </div>
              </button>
              {/* Liste des sessions */}
              <div style={{ borderTop: "1px solid var(--line)", padding: "10px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                {entries.map((e) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)" }}>
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>{e.pagesRead} p.</span>
                    {e.note && <span style={{ flex: 1, padding: "0 12px", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.note}</span>}
                    <span style={{ flexShrink: 0 }}>{e.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline chronologique ── */}
      <div style={{ position: "relative", paddingLeft: 36, display: viewMode === "parLivre" ? "none" : "block" }}>
        {/* Vertical connector */}
        {journalEntries.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 10,
              bottom: 10,
              width: 2,
              background: "var(--line)",
              borderRadius: 2,
            }}
          />
        )}

        {journalEntries.map((entry) => {
          const book = books.find((b) => b.id === entry.bookId);
          return (
            <div
              key={entry.id}
              style={{ position: "relative", marginBottom: 24 }}
            >
              {/* Golden dot */}
              <div
                style={{
                  position: "absolute",
                  left: -32,
                  top: 14,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "2px solid var(--bg)",
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "var(--surface)",
                  padding: "14px 18px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                {/* Clickable cover */}
                {book && (
                  <button
                    onClick={() => openBook(book.id)}
                    style={{
                      flexShrink: 0, width: 36, height: 54,
                      borderRadius: "3px 7px 7px 3px",
                      background: book.bg, overflow: "hidden",
                      border: "none", cursor: "pointer", padding: 0,
                      boxShadow: "0 4px 10px -4px rgba(0,0,0,.4)",
                    }}
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }}>
                        <span style={{ fontSize: 7, color: book.ink, lineHeight: 1.2, textAlign: "center", fontFamily: "Cinzel, serif" }}>{book.title.slice(0, 10)}</span>
                      </div>
                    )}
                  </button>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 12,
                      marginBottom: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => book && openBook(book.id)}
                      style={{
                        fontFamily: "var(--font-cinzel, Cinzel, serif)",
                        fontSize: 13.5, background: "none", border: "none",
                        cursor: book ? "pointer" : "default", padding: 0,
                        color: "var(--ink)", textAlign: "left",
                      }}
                    >
                      {book?.title ?? "Livre inconnu"}
                    </button>
                    <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                      {entry.date}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--accent)",
                      fontWeight: 600,
                      marginBottom: entry.note ? 8 : 0,
                    }}
                  >
                    {entry.pagesRead} page{entry.pagesRead > 1 ? "s" : ""} lues
                  </div>

                  {entry.note && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        fontStyle: "italic",
                        lineHeight: 1.55,
                      }}
                    >
                      {entry.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* end journal feed wrapper */}
    </div>
  );
}
