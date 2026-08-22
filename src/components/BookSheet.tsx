"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { GENRES, TROPES, SPICE_LABELS, RATING_LABELS } from "@/store/data";

export default function BookSheet() {
  const {
    books, open, layout, lists,
    openBook, setLayout, patchBook, addPlatform, navigate, setReadBook,
    ping,
  } = useStore();

  const book = books.find((b) => b.id === open);
  if (!book) return null;

  const [tropeDraft, setTropeDraft] = useState("");
  const [platformDraft, setPlatformDraft] = useState("");

  const patch = (fn: (b: typeof book) => typeof book) => patchBook(book.id, fn);

  const isColonnes = layout === "colonnes";
  const isImmersif = layout === "immersif";

  function setSpice(n: number) {
    patch((b) => ({ ...b, spice: b.spice === n ? 0 : n }));
  }
  function setRating(n: number) {
    patch((b) => ({ ...b, rating: b.rating === n ? 0 : n }));
  }
  function setGenre(g: string) {
    patch((b) => ({ ...b, genre: g }));
  }
  function addTrope(name: string) {
    if (!book.tropes.includes(name)) patch((b) => ({ ...b, tropes: [...b.tropes, name] }));
    setTropeDraft("");
  }
  function removeTrope(name: string) {
    patch((b) => ({ ...b, tropes: b.tropes.filter((t) => t !== name) }));
  }
  function toggleList(name: string) {
    patch((b) => ({
      ...b,
      lists: b.lists.includes(name) ? b.lists.filter((l) => l !== name) : [...b.lists, name],
    }));
  }
  function setComment(v: string) {
    patch((b) => ({ ...b, comment: v }));
  }
  function handleAddPlatform() {
    addPlatform(book.id, platformDraft);
    setPlatformDraft("");
  }
  function recommend() {
    navigate("messages");
    openBook(null);
    ping(`Recommandation envoyée pour « ${book.title} » ✉`);
  }
  function startTogether() {
    setReadBook(book.id);
    navigate("sync");
    openBook(null);
    ping(`Choisis avec qui tu lis « ${book.title} ».`);
  }

  const tropeSuggestions = TROPES.filter(
    (t) => !book.tropes.includes(t) && (tropeDraft === "" || t.toLowerCase().includes(tropeDraft.toLowerCase()))
  ).slice(0, 6);

  const sheetWidth = isImmersif ? 980 : 880;
  const sheetCols = isColonnes ? "260px 1fr" : "300px 1fr";

  const headerBg = "color-mix(in srgb, var(--bg) 88%, transparent)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(51,41,31,.34)", display: "flex", justifyContent: "flex-end" }}>
      <button onClick={() => openBook(null)} style={{ flex: 1 }} aria-label="Fermer" />

      <div
        className="animate-slidein max-[820px]:!w-full"
        style={{
          width: sheetWidth, maxWidth: "96vw", background: "var(--bg)",
          height: "100vh", overflowY: "auto",
          boxShadow: "-24px 0 60px -30px rgba(51,41,31,.5)",
        }}
      >
        {/* Sticky bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 5,
          display: "flex", alignItems: "center", gap: 10, padding: "16px 30px",
          background: headerBg, backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--line)",
        }}>
          {(["colonnes", "immersif"] as const).map((l) => {
            const active = layout === l;
            return (
              <button
                key={l}
                onClick={() => setLayout(l)}
                style={{
                  padding: "6px 13px", borderRadius: 999, fontSize: 12.5,
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  background: active ? "var(--soft)" : "transparent",
                  color: active ? "var(--accent)" : "var(--ink)",
                }}
              >
                {l === "colonnes" ? "Fiche en colonnes" : "Fiche immersive"}
              </button>
            );
          })}
          <button
            onClick={() => openBook(null)}
            style={{
              marginLeft: "auto", width: 32, height: 32, borderRadius: 10,
              background: "var(--surface2)", fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Immersive banner */}
        {isImmersif && (
          <div style={{ padding: "34px 34px 26px", background: book.bg, color: book.ink }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.7, marginBottom: 12 }}>
              {book.genre} · {book.year}
            </div>
            <div style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 40, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 620, textWrap: "pretty" }}>
              {book.title}
            </div>
            <div style={{ fontSize: 15, marginTop: 10, opacity: 0.8 }}>{book.author}</div>
            <div style={{ display: "flex", gap: 18, marginTop: 22, fontSize: 13.5, opacity: 0.9 }}>
              <span>{"🌶".repeat(book.spice) || "doux"}</span>
              <span>{"★".repeat(book.rating)}</span>
              <span>{book.pages} pages</span>
            </div>
          </div>
        )}

        <div style={{ padding: "30px 34px 60px" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: sheetCols, gap: 34, alignItems: "start" }}
            className="max-[820px]:!grid-cols-1 max-[820px]:!gap-[22px]"
          >
            {/* Left column */}
            <div>
              {isColonnes && (
                <div style={{
                  height: 300, borderRadius: "5px 14px 14px 5px",
                  padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                  background: book.bg, color: book.ink,
                  boxShadow: "0 20px 34px -18px rgba(51,41,31,.5)", marginBottom: 20,
                }}>
                  <div style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.72 }}>
                    {book.author}
                  </div>
                </div>
              )}

              {/* Platforms */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 13 }}>
                  Où le trouver
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {book.platforms.map((p) => (
                    <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5 }}>
                      <span>{p.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{p.langs}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <input
                    value={platformDraft}
                    onChange={(e) => setPlatformDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPlatform()}
                    placeholder="Kobo · FR, EN"
                    style={{
                      flex: 1, padding: "9px 11px", border: "1px solid var(--line)",
                      borderRadius: 9, background: "var(--bg)", fontSize: 12.5, outline: "none",
                    }}
                  />
                  <button
                    onClick={handleAddPlatform}
                    style={{ padding: "9px 12px", borderRadius: 9, background: "var(--soft)", color: "var(--accent)", fontSize: 12.5, fontWeight: 600 }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <button
                  onClick={recommend}
                  style={{ padding: 12, borderRadius: 12, background: "var(--accent)", color: "#fff", fontSize: 13.5, fontWeight: 600 }}
                >
                  Recommander à une amie
                </button>
                <button
                  onClick={startTogether}
                  style={{ padding: 12, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 13.5, fontWeight: 600 }}
                >
                  Lire ensemble
                </button>
              </div>
            </div>

            {/* Right column */}
            <div style={{ minWidth: 0 }}>
              {isColonnes && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                    {book.genre} · {book.year} · {book.lang}
                  </div>
                  <div style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 32, lineHeight: 1.12, letterSpacing: "-0.02em", textWrap: "pretty" }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 7 }}>{book.author}</div>
                </div>
              )}

              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 26px", maxWidth: 560, textWrap: "pretty" }}>
                {book.resume}
              </p>

              {/* Spice + Rating */}
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}
                className="max-[820px]:!grid-cols-1"
              >
                <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    Niveau de piment
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSpice(n)}
                        title={SPICE_LABELS[n]}
                        style={{
                          width: 34, height: 34, borderRadius: 11,
                          background: book.spice >= n ? "var(--soft)" : "var(--surface2)",
                          display: "grid", placeItems: "center", fontSize: 15,
                          opacity: book.spice >= n ? 1 : 0.28,
                          transition: "all .12s",
                        }}
                      >
                        🌶
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 11 }}>
                    {SPICE_LABELS[book.spice]}
                  </div>
                </div>

                <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    Ma note
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        style={{
                          fontSize: 24, lineHeight: 1,
                          color: book.rating >= n ? "var(--accent)" : "var(--line)",
                          transition: "color .12s",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 11 }}>
                    {RATING_LABELS[book.rating]}
                  </div>
                </div>
              </div>

              {/* Genre */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Genre</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {GENRES.map((g) => {
                    const active = book.genre === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        style={{
                          padding: "6px 12px", borderRadius: 999, fontSize: 12.5,
                          border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                          background: active ? "var(--soft)" : "transparent",
                          color: active ? "var(--accent)" : "var(--ink)",
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tropes */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Tropes</div>
                {book.tropes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                    {book.tropes.map((t) => (
                      <span
                        key={t}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "6px 8px 6px 12px", borderRadius: 999,
                          background: "var(--soft)", color: "var(--accent)", fontSize: 12.5,
                        }}
                      >
                        {t}
                        <button onClick={() => removeTrope(t)} style={{ fontSize: 11, opacity: 0.6 }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={tropeDraft}
                  onChange={(e) => setTropeDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tropeDraft.trim()) addTrope(tropeDraft.trim());
                  }}
                  placeholder="Chercher ou inventer un trope…"
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1px solid var(--line)", borderRadius: 10,
                    background: "var(--bg)", fontSize: 13, outline: "none",
                  }}
                />
                {tropeSuggestions.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                    {tropeSuggestions.map((t) => (
                      <button
                        key={t}
                        onClick={() => addTrope(t)}
                        style={{
                          padding: "6px 11px", borderRadius: 999,
                          border: "1px dashed var(--line)", fontSize: 12.5, color: "var(--muted)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                          (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                          (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                        }}
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lists */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Mes listes</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {lists.map((l) => {
                    const active = book.lists.includes(l.name);
                    return (
                      <button
                        key={l.name}
                        onClick={() => toggleList(l.name)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          padding: "7px 13px", borderRadius: 999, fontSize: 12.5,
                          border: `1px solid ${active ? l.dot : "var(--line)"}`,
                          background: active ? "var(--soft)" : "transparent",
                          color: active ? "var(--accent)" : "var(--ink)",
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: l.dot }} />
                        {l.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Mon commentaire</div>
                <textarea
                  value={book.comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ce que tu en as pensé, la scène que tu relis en boucle…"
                  style={{
                    width: "100%", minHeight: 96, resize: "vertical",
                    padding: "12px 14px", border: "1px solid var(--line)",
                    borderRadius: 12, background: "var(--bg)",
                    fontSize: 14, lineHeight: 1.6, outline: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
