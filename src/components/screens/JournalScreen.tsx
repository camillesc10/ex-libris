"use client";
import { useState } from "react";
import { useStore } from "@/store";
import TimelineScreen from "./TimelineScreen";

export default function JournalScreen() {
  const { books, journalEntries, addJournalEntry } = useStore();

  const booksEnCours = books.filter((b) => b.lists.includes("En cours"));

  const [bookId, setBookId] = useState<string>(booksEnCours[0]?.id ?? "");
  const [pages, setPages] = useState("");
  const [note, setNote] = useState("");
  const [mobileTab, setMobileTab] = useState<"fil" | "chronologie">("fil");

  const totalPages = journalEntries.reduce((sum, e) => sum + e.pagesRead, 0);

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
      {/* Mobile title */}
      <h1
        className="hidden max-[820px]:block"
        style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)",
          fontWeight: 400, fontSize: 25, letterSpacing: ".02em",
          margin: "0 0 20px", paddingTop: 10,
        }}
      >
        Journal
      </h1>

      {/* Mobile segmented control */}
      <div
        className="hidden max-[820px]:flex"
        style={{
          display: "flex", gap: 0, marginBottom: 24,
          background: "var(--surface)", borderRadius: 12, padding: 4,
          border: "1px solid var(--line)",
        }}
      >
        {(["fil", "chronologie"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 13,
              fontWeight: mobileTab === tab ? 600 : 400,
              background: mobileTab === tab ? "var(--soft)" : "transparent",
              color: mobileTab === tab ? "var(--accent)" : "var(--muted)",
              border: "none", cursor: "pointer", transition: "all .15s",
            }}
          >
            {tab === "fil" ? "Au fil des jours" : "Chronologie"}
          </button>
        ))}
      </div>

      {/* Desktop title */}
      <h2
        className="max-[820px]:hidden"
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

      {/* Chronologie tab (mobile only) */}
      {mobileTab === "chronologie" && (
        <div className="max-[820px]:block hidden">
          <TimelineScreen />
        </div>
      )}

      {/* Journal feed (always on desktop, conditionally on mobile) */}
      <div className={mobileTab === "chronologie" ? "max-[820px]:hidden" : ""}>

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

      {/* ── Total pages stat ── */}
      {journalEntries.length > 0 && (
        <div style={{ marginBottom: 28, fontSize: 13, color: "var(--muted)" }}>
          Total pages lues&nbsp;:{" "}
          <strong style={{ color: "var(--ink)" }}>
            {totalPages.toLocaleString()}
          </strong>
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

      {/* ── Timeline ── */}
      <div style={{ position: "relative", paddingLeft: 36 }}>
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
                }}
              >
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
                  <span
                    style={{
                      fontFamily: "var(--font-cinzel, Cinzel, serif)",
                      fontSize: 13.5,
                    }}
                  >
                    {book?.title ?? "Livre inconnu"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
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
          );
        })}
      </div>
      </div>{/* end journal feed wrapper */}
    </div>
  );
}
