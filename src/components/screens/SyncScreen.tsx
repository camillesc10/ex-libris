"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { SyncNote } from "@/types";

export default function SyncScreen() {
  const {
    books, readBook, readers, myPage, pageInput, notes, notePage, noteText,
    setReadBook, setPageInput, declarePage,
    setNotePage, setNoteText, addNote, ping,
  } = useStore();

  const [bookSearch, setBookSearch] = useState("");

  // Auto-select the current "En cours" book on first mount
  useEffect(() => {
    if (readBook) return;
    const enCours = books.find((b) => b.lists.includes("En cours"));
    if (!enCours) return;
    setReadBook(enCours.id);
    // Pre-load sealed notes from book.pageNotes
    const syncNotes: SyncNote[] = (enCours.pageNotes ?? []).map((n) => ({
      page: n.page, who: "Moi", text: n.text, when: n.date ?? "",
    }));
    if (syncNotes.length) {
      useStore.setState({ notes: syncNotes });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books]);

  const rb = books.find((b) => b.id === readBook);
  const totalPages = rb?.pages ?? 640;

  const filteredBooks = bookSearch.trim()
    ? books.filter((b) =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  const allProgress = [
    { who: "Moi", page: myPage, total: totalPages, color: "var(--accent)" },
    ...readers.map((r) => ({ who: r.name, page: r.page, total: totalPages, color: r.color })),
  ];

  const progressHeader = readers.length
    ? `Lecture partagée · ${readers.map((r) => r.name).join(", ")}`
    : "Mon avancée";

  const unlockHint = rb
    ? `Les notes des pages ≤ ${myPage} sont visibles.`
    : "";

  return (
    <div
      style={{ padding: "30px 38px", maxWidth: 1080, paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}
      className="max-[820px]:!px-[18px] max-[820px]:!pt-[22px]"
    >
      {/* Setup card */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 20, background: "var(--surface)", padding: "22px 24px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 20 }}>Lire ensemble</span>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Un livre, une ou plusieurs personnes — les notes restent scellées page par page pour chacun·e.</span>
        </div>

        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 9 }}>
          Le livre
        </div>

        {rb ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{
              padding: "7px 14px", borderRadius: 999, fontSize: 13,
              border: "1px solid var(--accent)", background: "var(--soft)", color: "var(--accent)", fontWeight: 600,
            }}>
              {rb.title}
            </span>
            <button
              onClick={() => { setReadBook(""); setBookSearch(""); ping("Livre changé."); }}
              style={{ fontSize: 12, color: "var(--muted)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)" }}
            >
              Changer
            </button>
            {!readers.length && (
              <button
                onClick={() => { setReadBook(""); ping("Lecture partagée annulée."); }}
                style={{ fontSize: 12, color: "var(--muted)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)" }}
              >
                Annuler
              </button>
            )}
            <button
              onClick={() => ping(`Lecture de « ${rb.title} » démarrée 📖`)}
              style={{
                marginLeft: "auto", padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 600,
                background: "var(--accent)", color: "#161C2F",
              }}
            >
              Commencer
            </button>
          </div>
        ) : (
          <div style={{ position: "relative", marginBottom: 4 }}>
            <input
              type="text"
              placeholder="Chercher un livre dans ma bibliothèque…"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              style={{
                width: "100%", maxWidth: 480, padding: "10px 14px",
                border: "1px solid var(--line)", borderRadius: 11,
                background: "var(--bg)", fontSize: 13.5, outline: "none", color: "var(--ink)",
              }}
            />
            {filteredBooks.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                {filteredBooks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setReadBook(b.id); setBookSearch(""); }}
                    style={{
                      padding: "7px 13px", borderRadius: 999, fontSize: 12.5,
                      border: "1px solid var(--line)", background: "transparent", color: "var(--ink)",
                    }}
                  >
                    {b.title}
                  </button>
                ))}
              </div>
            )}
            {bookSearch.trim() && filteredBooks.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
                Aucun livre trouvé — essaie un autre titre ou auteur.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress card */}
      {rb && (
        <div
          style={{ display: "flex", gap: 26, padding: 24, border: "1px solid var(--line)", borderRadius: 20, background: "var(--surface)", marginBottom: 26 }}
          className="max-[820px]:flex-wrap max-[820px]:!p-[18px]"
        >
          <div style={{
            width: 104, height: 154, flexShrink: 0, borderRadius: "4px 10px 10px 4px",
            position: "relative", overflow: "hidden",
            background: rb.bg, color: rb.ink,
            boxShadow: "0 12px 22px -12px rgba(51,41,31,.45)",
          }}>
            {rb.coverUrl ? (
              <img src={rb.coverUrl} alt={rb.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ padding: "13px 12px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 14, lineHeight: 1.18 }}>{rb.title}</div>
                <div style={{ fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.72 }}>{rb.author}</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
              {progressHeader}
            </div>
            <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 23, marginBottom: 18 }}>{rb.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {allProgress.map((p) => (
                <div key={p.who}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{p.who}</span>
                    <span style={{ color: "var(--muted)" }}>page {p.page} / {p.total} · {Math.round(p.page / p.total * 100)}%</span>
                  </div>
                  <div style={{ height: 9, borderRadius: 99, background: "var(--surface2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: p.color, width: `${(p.page / p.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>J&apos;en suis page</span>
              <input
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && declarePage()}
                style={{
                  width: 82, padding: "9px 12px", border: "1px solid var(--line)",
                  borderRadius: 10, background: "var(--bg)", fontSize: 14, outline: "none",
                  fontVariantNumeric: "tabular-nums",
                }}
              />
              <button
                onClick={declarePage}
                style={{ padding: "10px 16px", borderRadius: 10, background: "var(--accent)", color: "#161C2F", fontSize: 13, fontWeight: 600 }}
              >
                Je suis arrivée là
              </button>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{unlockHint}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fil scellé notes */}
      {rb && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {notes.map((n) => {
            const unlocked = n.page <= myPage;
            return (
              <div key={`${n.page}-${n.who}`} style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 76, flexShrink: 0, textAlign: "right", paddingTop: 14 }}>
                  <div style={{
                    fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 17,
                    color: unlocked ? "var(--accent)" : "var(--muted)",
                  }}>
                    p. {n.page}
                  </div>
                </div>
                <div style={{
                  flex: 1, padding: "16px 18px",
                  border: `1px solid ${unlocked ? "var(--line)" : "transparent"}`,
                  borderRadius: 16,
                  background: unlocked ? "var(--surface)" : "var(--surface2)",
                }}>
                  {unlocked ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: n.who === "Moi" ? "var(--accent)" : "#8A9BC1",
                          color: "#fff", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 600,
                        }}>
                          {n.who[0]}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{n.who}</span>
                        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{n.when}</span>
                      </div>
                      <div style={{ fontSize: 14.5, lineHeight: 1.6, textWrap: "pretty" }}>{n.text}</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "var(--muted)" }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 8, background: "var(--surface)",
                        display: "grid", placeItems: "center", fontSize: 12,
                      }}>
                        🔒
                      </span>
                      <span>Scellé jusqu&apos;à la page {n.page} — encore {n.page - myPage} pages</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Composer — scrollIntoView on focus for iOS keyboard */}
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ width: 76, flexShrink: 0, textAlign: "right", paddingTop: 13 }}>
              <input
                value={notePage}
                onChange={(e) => setNotePage(e.target.value)}
                placeholder="Page"
                style={{
                  width: 62, padding: "7px 8px", border: "1px solid var(--line)",
                  borderRadius: 9, background: "var(--surface)", fontSize: 13, textAlign: "center", outline: "none",
                }}
                onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </div>
            <div style={{ flex: 1, display: "flex", gap: 10 }}>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Laisse une note à cette page — elle restera scellée jusqu'à ce que tu y arrives."
                style={{
                  flex: 1, padding: "13px 15px", border: "1px solid var(--line)",
                  borderRadius: 14, background: "var(--surface)", fontSize: 14, outline: "none",
                }}
                onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
              <button
                onClick={addNote}
                style={{ padding: "13px 18px", borderRadius: 14, background: "var(--accent)", color: "#161C2F", fontSize: 13.5, fontWeight: 600 }}
              >
                Sceller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
