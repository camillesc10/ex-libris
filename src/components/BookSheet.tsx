"use client";
import { useState, useRef } from "react";
import { useStore } from "@/store";
import { GENRES, TROPES, SPICE_LABELS, RATING_LABELS } from "@/store/data";
import type { Book, PageNote } from "@/types";

const DNF_REASONS = ["Trop lent", "Personnages antipathiques", "Écriture difficile", "Traduction médiocre", "Sujet décevant", "Autre"];

export default function BookSheet() {
  const open = useStore((s) => s.open);
  const book = useStore((s) => s.books.find((b) => b.id === s.open));
  if (!open || !book) return null;
  return <BookSheetContent book={book} />;
}

function BookSheetContent({ book }: { book: Book }) {
  const {
    layout, lists, books,
    openBook, setLayout, patchBook, addPlatform, navigate, setReadBook,
    ping,
  } = useStore();

  const [tropeDraft, setTropeDraft] = useState("");
  const [platformDraft, setPlatformDraft] = useState("");
  const [burst, setBurst] = useState(false);
  const [notePageDraft, setNotePageDraft] = useState("");
  const [noteTextDraft, setNoteTextDraft] = useState("");
  const [relatedDraft, setRelatedDraft] = useState("");
  const [confetti, setConfetti] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const patch = (fn: (b: Book) => Book) => patchBook(book.id, fn);

  const isColonnes = layout === "colonnes";
  const isImmersif = layout === "immersif";

  function setSpice(n: number) { patch((b) => ({ ...b, spice: b.spice === n ? 0 : n })); }
  function setRating(n: number) {
    const next = book.rating === n ? 0 : n;
    patch((b) => ({ ...b, rating: next }));
    if (next === 5) { setBurst(true); setTimeout(() => setBurst(false), 900); }

    // Saga completion detection (#110/#104)
    if (book.series && next > 0) {
      const sagaBooks = books.filter((b) => b.series === book.series);
      const allRead = sagaBooks.every((b) => b.id === book.id ? next > 0 : b.rating > 0 && b.lists.includes("Déjà lu"));
      if (allRead && sagaBooks.length > 1) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2400);
        ping(`Saga « ${book.series} » terminée en ${sagaBooks.length} tomes 🎉`);
      }
    }
  }

  function extractPaletteFromImage(file: File) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) { URL.revokeObjectURL(url); return; }
      canvas.width = 16; canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); return; }
      ctx.drawImage(img, 0, 0, 16, 16);
      const data = ctx.getImageData(0, 0, 16, 16).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) { r += data[i]; g += data[i + 1]; b += data[i + 2]; count++; }
      }
      if (!count) { URL.revokeObjectURL(url); return; }
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const ink = lum > 140 ? "#161C2F" : "#F5EDD6";
      const bg = `rgb(${r},${g},${b})`;
      patch((bk) => ({ ...bk, bg, ink }));
      URL.revokeObjectURL(url);
      ping("Palette extraite depuis la couverture 🎨");
    };
    img.src = url;
  }
  function setGenre(g: string) { patch((b) => ({ ...b, genre: g })); }
  function addTrope(name: string) {
    if (!book.tropes.includes(name)) patch((b) => ({ ...b, tropes: [...b.tropes, name] }));
    setTropeDraft("");
  }
  function removeTrope(name: string) { patch((b) => ({ ...b, tropes: b.tropes.filter((t) => t !== name) })); }
  function toggleList(name: string) {
    patch((b) => ({ ...b, lists: b.lists.includes(name) ? b.lists.filter((l) => l !== name) : [...b.lists, name] }));
  }
  function handleAddPlatform() { addPlatform(book.id, platformDraft); setPlatformDraft(""); }
  function recommend() { navigate("messages"); openBook(null); ping(`Recommandation envoyée pour « ${book.title} » ✉`); }
  function startTogether() { setReadBook(book.id); navigate("sync"); openBook(null); ping(`Choisis avec qui tu lis « ${book.title} ».`); }

  function addPageNote() {
    const page = parseInt(notePageDraft, 10);
    if (isNaN(page) || !noteTextDraft.trim()) return;
    const note: PageNote = { page, text: noteTextDraft.trim(), date: new Date().toISOString().slice(0, 10) };
    patch((b) => ({ ...b, pageNotes: [...(b.pageNotes || []), note].sort((a, z) => a.page - z.page) }));
    setNotePageDraft(""); setNoteTextDraft("");
  }
  function removePageNote(idx: number) {
    patch((b) => ({ ...b, pageNotes: (b.pageNotes || []).filter((_, i) => i !== idx) }));
  }

  function addRelated(bookId: string) {
    if (!bookId || (book.relatedBooks || []).includes(bookId)) return;
    patch((b) => ({ ...b, relatedBooks: [...(b.relatedBooks || []), bookId] }));
    setRelatedDraft("");
  }
  function removeRelated(bookId: string) {
    patch((b) => ({ ...b, relatedBooks: (b.relatedBooks || []).filter((id) => id !== bookId) }));
  }

  const tropeSuggestions = TROPES.filter(
    (t) => !book.tropes.includes(t) && (tropeDraft === "" || t.toLowerCase().includes(tropeDraft.toLowerCase()))
  ).slice(0, 6);

  const relatedCandidates = books.filter((b) => b.id !== book.id && !(book.relatedBooks || []).includes(b.id) &&
    (relatedDraft === "" || b.title.toLowerCase().includes(relatedDraft.toLowerCase()) || b.author.toLowerCase().includes(relatedDraft.toLowerCase()))
  ).slice(0, 5);

  const isAbandoned = book.lists.includes("Abandonné");

  const sheetWidth = isImmersif ? 980 : 880;
  const sheetCols = isColonnes ? "260px 1fr" : "300px 1fr";
  const headerBg = "color-mix(in srgb, var(--bg) 88%, transparent)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(51,41,31,.34)", display: "flex", justifyContent: "flex-end" }}>
      <button onClick={() => openBook(null)} style={{ flex: 1 }} aria-label="Fermer" />

      <div
        className="animate-slidein max-[820px]:!w-full"
        style={{ width: sheetWidth, maxWidth: "96vw", background: "var(--bg)", height: "100vh", overflowY: "auto", boxShadow: "-24px 0 60px -30px rgba(51,41,31,.5)", position: "relative" }}
      >
        {/* Confetti overlay (#104) */}
        {confetti && (
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  position: "absolute",
                  top: "-10px",
                  left: `${(i * 37) % 100}%`,
                  width: 8, height: 8,
                  borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "0" : "2px",
                  background: ["#E0B84A","#7DB08A","#8A9BC1","#C4735C","#C49A5E"][i % 5],
                  animation: `confettiFall ${1.2 + (i % 5) * 0.25}s ${(i * 0.07)}s ease-in forwards`,
                }}
              />
            ))}
          </div>
        )}
        {/* Hidden canvas for palette extraction (#107) */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {/* Sticky bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 10, padding: "16px 30px", background: headerBg, backdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)" }}>
          {(["colonnes", "immersif"] as const).map((l) => {
            const active = layout === l;
            return (
              <button key={l} onClick={() => setLayout(l)} style={{ padding: "6px 13px", borderRadius: 999, fontSize: 12.5, border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`, background: active ? "var(--soft)" : "transparent", color: active ? "var(--accent)" : "var(--ink)" }}>
                {l === "colonnes" ? "Fiche en colonnes" : "Fiche immersive"}
              </button>
            );
          })}
          <button onClick={() => openBook(null)} style={{ marginLeft: "auto", width: 32, height: 32, borderRadius: 10, background: "var(--surface2)", fontSize: 14 }}>✕</button>
        </div>

        {isImmersif && (
          <div style={{ padding: "34px 34px 26px", background: book.bg, color: book.ink }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.7, marginBottom: 12 }}>{book.genre} · {book.year}</div>
            <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 40, lineHeight: 1.08, letterSpacing: ".02em", maxWidth: 620, textWrap: "pretty" }}>{book.title}</div>
            <div style={{ fontSize: 15, marginTop: 10, opacity: 0.8 }}>{book.author}</div>
            <div style={{ display: "flex", gap: 18, marginTop: 22, fontSize: 13.5, opacity: 0.9 }}>
              <span>{"🌶".repeat(book.spice) || "doux"}</span>
              <span>{"★".repeat(book.rating)}</span>
              <span>{book.pages} pages</span>
            </div>
          </div>
        )}

        <div style={{ padding: "30px 34px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: sheetCols, gap: 34, alignItems: "start" }} className="max-[820px]:!grid-cols-1 max-[820px]:!gap-[22px]">

            {/* Left column */}
            <div>
              {isColonnes && (
                <div style={{ height: 300, borderRadius: "5px 14px 14px 5px", padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: book.bg, color: book.ink, boxShadow: "0 20px 34px -18px rgba(51,41,31,.5)", marginBottom: 20 }}>
                  <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 22, lineHeight: 1.2, letterSpacing: ".02em" }}>{book.title}</div>
                  <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.72 }}>{book.author}</div>
                </div>
              )}

              {/* Platforms */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Où le trouver</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {book.platforms.map((p) => (
                    <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5 }}>
                      <span>{p.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{p.langs}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <input value={platformDraft} onChange={(e) => setPlatformDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPlatform()} placeholder="Kobo · FR, EN" style={inputStyle} />
                  <button onClick={handleAddPlatform} style={{ padding: "9px 12px", borderRadius: 9, background: "var(--soft)", color: "var(--accent)", fontSize: 12.5, fontWeight: 600 }}>+</button>
                </div>
              </div>

              {/* Rappel de reprise (#32) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Rappel de reprise</div>
                <input type="date" value={book.reminderDate || ""} onChange={(e) => patch((b) => ({ ...b, reminderDate: e.target.value || undefined }))} style={{ ...inputStyle, colorScheme: "dark" }} />
                {book.reminderDate && (
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                    Rappel fixé au {new Date(book.reminderDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
                <button onClick={recommend} style={{ padding: 12, borderRadius: 12, background: "var(--accent)", color: "#161C2F", fontSize: 13.5, fontWeight: 600 }}>Recommander à une amie</button>
                <button onClick={startTogether} style={{ padding: 12, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 13.5, fontWeight: 600 }}>Lire ensemble</button>
              </div>

              {/* FNAC buy link (#113) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Acheter</div>
                <a
                  href={`https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(`${book.title} ${book.author}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 14px", borderRadius: 11, minHeight: 44,
                    background: "#E2A900", color: "#1A1200",
                    fontWeight: 600, fontSize: 13.5, textDecoration: "none",
                    transition: "opacity .12s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.82"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                >
                  <span style={{ fontSize: 18 }}>📦</span> Trouver sur la Fnac
                </a>
              </div>

              {/* Palette from cover image (#107) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Couleur de couverture</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: book.bg, border: "2px solid var(--line)", flexShrink: 0 }} />
                  <button
                    onClick={() => imgInputRef.current?.click()}
                    style={{ padding: "9px 14px", borderRadius: 10, minHeight: 44, border: "1px solid var(--line)", background: "var(--surface2)", fontSize: 13, color: "var(--ink)" }}
                  >
                    🖼 Importer la couverture
                  </button>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) extractPaletteFromImage(f); e.target.value = ""; }}
                  />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ minWidth: 0 }}>
              {isColonnes && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>{book.genre} · {book.year} · {book.lang}</div>
                  <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 30, lineHeight: 1.15, letterSpacing: ".02em", textWrap: "pretty" }}>{book.title}</div>
                  <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 7 }}>{book.author}</div>
                </div>
              )}

              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 26px", maxWidth: 560, textWrap: "pretty" }}>{book.resume}</p>

              {/* Spice + Rating */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }} className="max-[820px]:!grid-cols-1">
                <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18 }}>
                  <div style={labelStyle}>Niveau de piment</div>
                  <div style={{ display: "flex", gap: 7 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setSpice(n)} title={SPICE_LABELS[n]} style={{ width: 34, height: 34, borderRadius: 11, background: book.spice >= n ? "var(--soft)" : "var(--surface2)", display: "grid", placeItems: "center", fontSize: 15, opacity: book.spice >= n ? 1 : 0.28, transition: "all .12s" }}>🌶</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 11 }}>{SPICE_LABELS[book.spice]}</div>
                </div>

                <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, position: "relative", overflow: "hidden" }}>
                  <div style={labelStyle}>Ma note</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} style={{ fontSize: 24, lineHeight: 1, color: book.rating >= n ? "var(--accent)" : "var(--line)", transition: "color .12s" }}>★</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 11 }}>{RATING_LABELS[book.rating]}</div>
                  {burst && (
                    <div className="star-burst" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                      {["✦","✦","✦","✦","✦","✦"].map((s, i) => <span key={i} className={`burst-star burst-${i}`}>{s}</span>)}
                    </div>
                  )}
                </div>
              </div>

              {/* Genre */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Genre</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {GENRES.map((g) => {
                    const active = book.genre === g;
                    return <button key={g} onClick={() => setGenre(g)} style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`, background: active ? "var(--soft)" : "transparent", color: active ? "var(--accent)" : "var(--ink)" }}>{g}</button>;
                  })}
                </div>
              </div>

              {/* Tropes */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Tropes</div>
                {book.tropes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                    {book.tropes.map((t) => (
                      <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 8px 6px 12px", borderRadius: 999, background: "var(--soft)", color: "var(--accent)", fontSize: 12.5 }}>
                        {t}
                        <button onClick={() => removeTrope(t)} style={{ fontSize: 11, opacity: 0.6 }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <input value={tropeDraft} onChange={(e) => setTropeDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && tropeDraft.trim()) addTrope(tropeDraft.trim()); }} placeholder="Chercher ou inventer un trope…" style={inputStyle} />
                {tropeSuggestions.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                    {tropeSuggestions.map((t) => (
                      <button key={t} onClick={() => addTrope(t)} style={{ padding: "6px 11px", borderRadius: 999, border: "1px dashed var(--line)", fontSize: 12.5, color: "var(--muted)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                      >+ {t}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lists */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Mes listes</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {lists.map((l) => {
                    const active = book.lists.includes(l.name);
                    return (
                      <button key={l.name} onClick={() => toggleList(l.name)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999, fontSize: 12.5, border: `1px solid ${active ? l.dot : "var(--line)"}`, background: active ? "var(--soft)" : "transparent", color: active ? "var(--accent)" : "var(--ink)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: l.dot }} />{l.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DNF reason (#55) */}
              {isAbandoned && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                  <div style={labelStyle}>Raison d&apos;abandon</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {DNF_REASONS.map((r) => {
                      const active = book.dnfReason === r;
                      return <button key={r} onClick={() => patch((b) => ({ ...b, dnfReason: active ? "" : r }))} style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`, background: active ? "var(--soft)" : "transparent", color: active ? "var(--accent)" : "var(--muted)" }}>{r}</button>;
                    })}
                  </div>
                </div>
              )}

              {/* Series + dates */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Saga & dates</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 12 }}>
                  <input value={book.series || ""} onChange={(e) => patch((b) => ({ ...b, series: e.target.value || undefined }))} placeholder="Nom de la saga (ex. ACOTAR)" style={inputStyle} />
                  <input type="number" value={book.seriesNum ?? ""} onChange={(e) => patch((b) => ({ ...b, seriesNum: e.target.value ? parseInt(e.target.value, 10) : undefined }))} placeholder="Tome" style={{ width: 72, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Commencé le</div>
                    <input type="date" value={book.startedAt || ""} onChange={(e) => patch((b) => ({ ...b, startedAt: e.target.value || undefined }))} style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", fontSize: 12.5, outline: "none", colorScheme: "dark" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Terminé le</div>
                    <input type="date" value={book.finishedAt || ""} onChange={(e) => patch((b) => ({ ...b, finishedAt: e.target.value || undefined }))} style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", fontSize: 12.5, outline: "none", colorScheme: "dark" }} />
                  </div>
                </div>
              </div>

              {/* Commentaire structuré (#26) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Mon commentaire</div>
                <textarea value={book.comment} onChange={(e) => patch((b) => ({ ...b, comment: e.target.value }))} placeholder="Ce que tu en as pensé, la scène que tu relis en boucle…" style={{ width: "100%", minHeight: 80, resize: "vertical", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)", fontSize: 13.5, lineHeight: 1.6, outline: "none", marginBottom: 10 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Points forts</div>
                    <textarea value={book.pros || ""} onChange={(e) => patch((b) => ({ ...b, pros: e.target.value }))} placeholder="Ce qui t'a emballée…" rows={3} style={{ width: "100%", resize: "vertical", padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)", fontSize: 12.5, lineHeight: 1.5, outline: "none" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Bémols</div>
                    <textarea value={book.cons || ""} onChange={(e) => patch((b) => ({ ...b, cons: e.target.value }))} placeholder="Ce qui t'a dérangée…" rows={3} style={{ width: "100%", resize: "vertical", padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)", fontSize: 12.5, lineHeight: 1.5, outline: "none" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Citation mémorable</div>
                <input value={book.quote || ""} onChange={(e) => patch((b) => ({ ...b, quote: e.target.value }))} placeholder="« La citation qui te hante encore… »" style={inputStyle} />
              </div>

              {/* Notes par page (#11/#67) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Notes par page</div>
                {(book.pageNotes || []).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    {(book.pageNotes || []).map((n, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0, width: 38, textAlign: "center", padding: "4px 0", borderRadius: 8, background: "var(--soft)", color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>p.{n.page}</div>
                        <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55 }}>{n.text}</div>
                        <button onClick={() => removePageNote(i)} style={{ flexShrink: 0, fontSize: 11, color: "var(--muted)", opacity: 0.6 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={notePageDraft} onChange={(e) => setNotePageDraft(e.target.value)} placeholder="Page" style={{ width: 72, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", fontSize: 13, outline: "none" }} />
                  <input value={noteTextDraft} onChange={(e) => setNoteTextDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPageNote()} placeholder="Ta note sur cette page…" style={{ flex: 1, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", fontSize: 13, outline: "none" }} />
                  <button onClick={addPageNote} style={{ padding: "9px 13px", borderRadius: 9, background: "var(--soft)", color: "var(--accent)", fontWeight: 600 }}>+</button>
                </div>
              </div>

              {/* Livres liés (#35) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                <div style={labelStyle}>Si tu as aimé ça…</div>
                {(book.relatedBooks || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {(book.relatedBooks || []).map((rid) => {
                      const rel = books.find((b) => b.id === rid);
                      if (!rel) return null;
                      return (
                        <div key={rid} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 12px", borderRadius: 999, border: "1px solid var(--line)", fontSize: 12.5 }}>
                          <button onClick={() => openBook(rel.id)} style={{ color: "var(--accent)" }}>{rel.title}</button>
                          <button onClick={() => removeRelated(rid)} style={{ fontSize: 11, opacity: 0.5 }}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <input value={relatedDraft} onChange={(e) => setRelatedDraft(e.target.value)} placeholder="Chercher un livre à lier…" style={inputStyle} />
                {relatedDraft && relatedCandidates.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                    {relatedCandidates.map((b) => (
                      <button key={b.id} onClick={() => addRelated(b.id)} style={{ textAlign: "left", padding: "8px 12px", borderRadius: 9, background: "var(--surface2)", fontSize: 13 }}>
                        {b.title} <span style={{ color: "var(--muted)", fontSize: 12 }}>— {b.author}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Même auteur dans la PAL (#109) */}
              {(() => {
                const sameAuthorPAL = books.filter(
                  (b) => b.id !== book.id && b.author === book.author && b.lists.includes("PAL")
                );
                if (!sameAuthorPAL.length) return null;
                return (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18, marginBottom: 16 }}>
                    <div style={labelStyle}>Autre(s) livre(s) de {book.author} dans ta PAL</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {sameAuthorPAL.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => openBook(b.id)}
                          style={{
                            textAlign: "left", padding: "9px 12px", borderRadius: 10, minHeight: 44,
                            background: "var(--surface2)", fontSize: 13,
                            border: "1px solid var(--line)", color: "var(--ink)",
                            display: "flex", alignItems: "center", gap: 10,
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.bg, flexShrink: 0 }} />
                          {b.title}
                          {b.seriesNum && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>Tome {b.seriesNum}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Avis des amies (#106) */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: 18 }}>
                <div style={labelStyle}>Ce qu&apos;en pensent tes amies</div>
                {[
                  { name: "Camille", rating: 4, comment: "Dévoré en une nuit, les personnages sont trop bien écrits." },
                  { name: "Noor", rating: 3, comment: "Bonne lecture mais la fin m'a un peu déçue." },
                ].map((f) => (
                  <div key={f.name} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                      background: f.name === "Camille" ? "#C4735C" : "#8A6FB0",
                      color: "#fff", display: "grid", placeItems: "center",
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {f.name[0]}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</span>
                        <span style={{ fontSize: 13, color: "var(--accent)" }}>{"★".repeat(f.rating)}<span style={{ opacity: .28 }}>{"★".repeat(5 - f.rating)}</span></span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, fontStyle: "italic" }}>
                        &laquo;&nbsp;{f.comment}&nbsp;&raquo;
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", fontSize: 13, outline: "none" };
