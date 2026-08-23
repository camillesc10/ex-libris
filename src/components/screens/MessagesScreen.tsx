"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store";

interface Conseil {
  id: string;
  fromName: string;
  title: string;
  author: string;
  note: string;
  date: string;
  inPal: boolean;
}

function loadConseils(): Conseil[] {
  try {
    return JSON.parse(localStorage.getItem("ex-libris-conseils") || "[]");
  } catch { return []; }
}

function saveConseils(list: Conseil[]) {
  try { localStorage.setItem("ex-libris-conseils", JSON.stringify(list)); } catch {}
}

export default function MessagesScreen() {
  const { books, ping, setQuery, navigate } = useStore();
  const [conseils, setConseils] = useState<Conseil[]>([]);
  const [fromName, setFromName] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { setConseils(loadConseils()); }, []);

  function addConseil() {
    if (!title.trim() || !fromName.trim()) return;
    const c: Conseil = {
      id: `c${Date.now()}`,
      fromName: fromName.trim(),
      title: title.trim(),
      author: author.trim(),
      note: note.trim(),
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      inPal: false,
    };
    const next = [c, ...conseils];
    setConseils(next);
    saveConseils(next);
    setFromName(""); setTitle(""); setAuthor(""); setNote("");
  }

  function addToPal(c: Conseil) {
    const inLib = books.some((b) => b.title.toLowerCase() === c.title.toLowerCase());
    if (inLib) { ping(`« ${c.title} » est déjà dans ta bibliothèque.`); return; }
    setQuery(c.title + (c.author ? " " + c.author : ""));
    navigate("search");
    ping(`Recherche de « ${c.title} »…`);
  }

  function remove(id: string) {
    const next = conseils.filter((c) => c.id !== id);
    setConseils(next);
    saveConseils(next);
  }

  return (
    <div style={{ padding: "30px 38px", maxWidth: 720 }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">

      {/* Add form */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 20, background: "var(--surface)", padding: "20px 22px", marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
          Nouveau conseil
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Qui te l'a conseillé ?"
            style={inputStyle}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du livre *"
            style={{ ...inputStyle, flex: "2 1 200px" }}
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Auteur·ice (optionnel)"
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addConseil()}
            placeholder="Ce qu'elles en ont dit… (optionnel)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addConseil}
            disabled={!title.trim() || !fromName.trim()}
            style={{
              padding: "11px 20px", borderRadius: 11, background: "var(--accent)",
              color: "#161C2F", fontSize: 13.5, fontWeight: 600,
              opacity: (!title.trim() || !fromName.trim()) ? 0.5 : 1,
            }}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* List */}
      {conseils.length === 0 ? (
        <div style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic" }}>
          Aucun conseil pour l&apos;instant — note les livres que tes amies te recommandent.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {conseils.map((c) => (
            <div key={c.id} style={{
              display: "flex", gap: 16, padding: "16px 18px",
              border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 36, height: 36, flexShrink: 0, borderRadius: "50%",
                background: "var(--soft)", color: "var(--accent)",
                display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700,
              }}>
                {c.fromName[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 15 }}>{c.title}</span>
                  {c.author && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{c.author}</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: c.note ? 6 : 0 }}>
                  Conseillé par <strong style={{ color: "var(--ink)" }}>{c.fromName}</strong> · {c.date}
                </div>
                {c.note && <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink)", fontStyle: "italic" }}>&ldquo;{c.note}&rdquo;</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => addToPal(c)}
                  style={{
                    padding: "8px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                    background: "var(--soft)", color: "var(--accent)", border: "1px solid var(--line)",
                  }}
                >
                  Ajouter à ma PAL
                </button>
                <button
                  onClick={() => remove(c.id)}
                  style={{ padding: "8px 10px", borderRadius: 9, fontSize: 12, color: "var(--muted)", border: "1px solid var(--line)", background: "transparent" }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: "1 1 160px", padding: "11px 14px", border: "1px solid var(--line)",
  borderRadius: 11, background: "var(--bg)", fontSize: 14, outline: "none", color: "var(--ink)",
};
