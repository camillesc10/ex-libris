"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store";

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${pad(m % 60)}m`;
  return `${pad(m)}:${pad(s % 60)}`;
}

const LS_KEY = "exlibris_timer_v1";

type PersistedTimer = {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookBg: string;
  pageStart: number;
  startedAt: number;
  accumulated: number;
  paused: boolean;
};

function loadTimer(): PersistedTimer | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveTimer(t: PersistedTimer | null) {
  try {
    if (t) localStorage.setItem(LS_KEY, JSON.stringify(t));
    else localStorage.removeItem(LS_KEY);
  } catch { /* no-op */ }
}

export default function ReadingTimer() {
  type Phase = "idle" | "picking" | "running" | "paused" | "saving";

  const { books, updatePage, addJournalEntry } = useStore();
  const booksEnCours = books.filter((b) => b.lists.includes("En cours"));

  const [phase, setPhase] = useState<Phase>("idle");
  const [timer, setTimer] = useState<PersistedTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [search, setSearch] = useState("");
  const [pageEnd, setPageEnd] = useState("");
  const [saveTotal, setSaveTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const t = loadTimer();
    if (!t) return;
    setTimer(t);
    if (t.paused) {
      setElapsed(t.accumulated);
      setPhase("paused");
    } else {
      setElapsed(t.accumulated + (Date.now() - t.startedAt));
      setPhase("running");
    }
  }, []);

  useEffect(() => {
    if (phase === "running" && timer) {
      tickRef.current = setInterval(() => {
        setElapsed(timer.accumulated + (Date.now() - timer.startedAt));
      }, 500);
    } else {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase, timer]);

  function startSession(bookId: string) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const t: PersistedTimer = {
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookBg: book.bg,
      pageStart: book.page,
      startedAt: Date.now(),
      accumulated: 0,
      paused: false,
    };
    setTimer(t);
    setElapsed(0);
    setPhase("running");
    saveTimer(t);
    setSearch("");
  }

  function pause() {
    if (!timer) return;
    const newAcc = timer.accumulated + (Date.now() - timer.startedAt);
    const updated = { ...timer, accumulated: newAcc, paused: true };
    setTimer(updated);
    setElapsed(newAcc);
    setPhase("paused");
    saveTimer(updated);
  }

  function resume() {
    if (!timer) return;
    const updated = { ...timer, startedAt: Date.now(), paused: false };
    setTimer(updated);
    setPhase("running");
    saveTimer(updated);
  }

  function stop() {
    if (!timer) return;
    const total = timer.paused
      ? timer.accumulated
      : timer.accumulated + (Date.now() - timer.startedAt);
    setSaveTotal(total);
    setPageEnd("");
    setPhase("saving");
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }

  const handleSave = useCallback(() => {
    if (!timer) return;
    const end = parseInt(pageEnd, 10);
    if (isNaN(end) || end <= timer.pageStart) return;
    setSaving(true);
    try {
      updatePage(timer.bookId, end);
      addJournalEntry({ bookId: timer.bookId, pagesRead: end - timer.pageStart, note: "" });
      saveTimer(null);
      setTimer(null);
      setPhase("idle");
    } finally {
      setSaving(false);
    }
  }, [timer, pageEnd, updatePage, addJournalEntry]);

  function discard() {
    saveTimer(null);
    setTimer(null);
    setPhase("idle");
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }

  const filtered = booksEnCours.filter((b) =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  const base: React.CSSProperties = { position: "fixed", bottom: 24, right: 24, zIndex: 1000 };

  const panel: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 18,
    padding: 20,
    width: 300,
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    color: "var(--ink)",
  };

  // ── IDLE ──────────────────────────────────────────────────────────────────────
  if (phase === "idle") return (
    <div style={base}>
      <button
        onClick={() => setPhase("picking")}
        style={{
          background: "var(--accent)",
          border: "none", borderRadius: 50, padding: "12px 20px",
          color: "#161C2F", fontWeight: 700, fontSize: 14, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 8,
          transition: "transform .15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.07)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        📖 Lire
      </button>
    </div>
  );

  // ── PICKING ───────────────────────────────────────────────────────────────────
  if (phase === "picking") return (
    <div style={base}>
      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--font-cinzel, Cinzel, serif)" }}>Choisir un livre</span>
          <button onClick={() => setPhase("idle")} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          style={{
            width: "100%", marginBottom: 10, padding: "8px 12px", fontSize: 13,
            border: "1px solid var(--line)", borderRadius: 9,
            background: "var(--surface2)", color: "var(--ink)", outline: "none",
          }}
        />
        <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {booksEnCours.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Aucun livre en cours.
            </div>
          )}
          {filtered.map((book) => (
            <button
              key={book.id}
              onClick={() => startSession(book.id)}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--line)",
                borderLeft: `3px solid ${book.bg}`,
                borderRadius: 10, padding: "9px 12px",
                cursor: "pointer", textAlign: "left", color: "var(--ink)",
                transition: "background .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--soft)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface2)"; }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{book.title}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {book.author} · page {book.page}{book.pages > 0 ? `/${book.pages}` : ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RUNNING / PAUSED ──────────────────────────────────────────────────────────
  if ((phase === "running" || phase === "paused") && timer) {
    const pulsing = phase === "running";
    return (
      <div style={base}>
        <div style={{
          ...panel,
          borderLeft: `4px solid ${timer.bookBg}`,
          padding: "16px 18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-cinzel, Cinzel, serif)" }}>
                {timer.bookTitle}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{timer.bookAuthor}</div>
            </div>
            <button
              onClick={discard}
              title="Abandonner la session"
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: "0 0 0 8px" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
            >×</button>
          </div>

          <div style={{
            textAlign: "center", marginBottom: 14,
            fontFamily: "monospace", fontSize: 36, fontWeight: 800, letterSpacing: 3,
            color: pulsing ? "var(--accent)" : "var(--muted)",
            transition: "color .3s",
          }}>
            {fmtMs(elapsed)}
          </div>
          {phase === "paused" && (
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: -10, marginBottom: 10 }}>En pause</div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {phase === "running" ? (
              <button onClick={pause} style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontSize: 20 }}>⏸</button>
            ) : (
              <button onClick={resume} style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontSize: 20, color: "#161C2F" }}>▶</button>
            )}
            <button
              onClick={stop}
              style={{ flex: 2, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.22)", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#f87171" }}
            >
              ⏹ Terminer
            </button>
          </div>

          <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
            Page de départ : <strong style={{ color: "var(--ink)" }}>{timer.pageStart}</strong>
          </div>
        </div>
      </div>
    );
  }

  // ── SAVING ────────────────────────────────────────────────────────────────────
  if (phase === "saving" && timer) {
    const end = parseInt(pageEnd, 10);
    const validEnd = !isNaN(end) && end > timer.pageStart;
    const pagesRead = validEnd ? end - timer.pageStart : 0;

    return (
      <div style={base}>
        <div style={{ ...panel, borderLeft: `4px solid ${timer.bookBg}` }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, fontFamily: "var(--font-cinzel, Cinzel, serif)" }}>Session terminée</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {timer.bookTitle}
          </div>

          <div style={{
            background: "var(--surface2)", border: "1px solid var(--line)",
            borderRadius: 12, padding: "10px 16px", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>⏱ Durée</span>
            <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 22, color: "var(--accent)" }}>
              {fmtMs(saveTotal)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Départ</div>
              <div style={{
                background: "var(--surface2)", borderRadius: 8, padding: "9px 0",
                textAlign: "center", fontSize: 16, fontWeight: 700, color: "var(--ink)",
              }}>{timer.pageStart}</div>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 20, paddingBottom: 6 }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 5 }}>Arrivée *</div>
              <input
                autoFocus
                type="number"
                value={pageEnd}
                onChange={(e) => setPageEnd(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder={String(timer.pageStart + 1)}
                min={timer.pageStart + 1}
                style={{
                  width: "100%", textAlign: "center", fontSize: 16, fontWeight: 700,
                  padding: "8px 0", border: "1px solid var(--line)", borderRadius: 8,
                  background: "var(--surface2)", color: "var(--ink)", outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ minHeight: 22, marginBottom: 14, textAlign: "center" }}>
            {validEnd && (
              <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                +{pagesRead} page{pagesRead > 1 ? "s" : ""} lue{pagesRead > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={discard}
              style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !validEnd}
              style={{
                flex: 2, background: validEnd && !saving ? "var(--accent)" : "var(--surface2)",
                border: "none", borderRadius: 10, padding: "10px 0",
                cursor: validEnd && !saving ? "pointer" : "not-allowed",
                fontSize: 13, fontWeight: 600, color: validEnd && !saving ? "#161C2F" : "var(--muted)",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Enregistrement…" : "💾 Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
