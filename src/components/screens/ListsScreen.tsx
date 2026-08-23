"use client";
import { useStore } from "@/store";

const DEFAULT_SHELVES = new Set(["En cours", "PAL", "Déjà lu", "En pause", "À relire", "Abandonné", "Liste de souhaits"]);

export default function ListsScreen() {
  const { books, lists, newList, setNewList, addList, deleteList, openBook, generateShareCode } = useStore();

  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      {/* Create list */}
      <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
        <input
          value={newList}
          onChange={(e) => setNewList(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addList()}
          placeholder="Nouvelle liste — « comfort reads d'automne »"
          style={{
            flex: 1, maxWidth: 420, padding: "12px 14px",
            border: "1px solid var(--line)", borderRadius: 11,
            background: "var(--surface)", fontSize: 14, outline: "none",
          }}
        />
        <button
          onClick={addList}
          style={{
            padding: "12px 18px", borderRadius: 11,
            background: "var(--accent)", color: "#161C2F", fontSize: 13.5, fontWeight: 600,
          }}
        >
          Créer la liste
        </button>
      </div>

      {/* Lists grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
        {lists.map((l) => {
          const listBooks = books.filter((b) => b.lists.includes(l.name)).slice(0, 5);
          const count = books.filter((b) => b.lists.includes(l.name)).length;
          const isDefault = DEFAULT_SHELVES.has(l.name);
          return (
            <div
              key={l.name}
              style={{ border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface)", padding: 20, position: "relative" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: l.dot, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 17 }}>{l.name}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", marginRight: isDefault ? 0 : 28 }}>
                  {count} livre(s)
                </span>
                {!isDefault && (
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer la liste « ${l.name} » ? Les livres resteront dans ta bibliothèque.`)) {
                        deleteList(l.name);
                      }
                    }}
                    title="Supprimer cette liste"
                    style={{
                      position: "absolute", top: 14, right: 14,
                      width: 24, height: 24, borderRadius: 6,
                      background: "transparent", border: "1px solid var(--line)",
                      fontSize: 13, color: "var(--muted)", lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all .12s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,50,50,.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#e05555"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e05555"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)"; }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: l.shareCode ? 8 : 16 }}>{l.desc}</div>
              {/* Share code (#34) */}
              {!isDefault && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {l.shareCode ? (
                    <>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Code&nbsp;:</span>
                      <code style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".16em", color: "var(--accent)", background: "var(--soft)", padding: "3px 8px", borderRadius: 6 }}>
                        {l.shareCode}
                      </code>
                      <button
                        onClick={() => generateShareCode(l.name)}
                        style={{ fontSize: 11, color: "var(--muted)", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent" }}
                      >
                        Regénérer
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => generateShareCode(l.name)}
                      style={{ fontSize: 12, color: "var(--accent)", padding: "4px 10px", borderRadius: 7, border: "1px solid var(--accent)", background: "transparent" }}
                    >
                      Partager la liste
                    </button>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 104, overflow: "hidden" }}>
                {listBooks.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "var(--muted)", fontStyle: "italic" }}>
                    Encore vide — ajoute des livres depuis leur fiche.
                  </div>
                ) : (
                  listBooks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => openBook(b.id)}
                      className="mini-cover"
                      style={{
                        flexShrink: 0, width: 66, height: 98,
                        borderRadius: "3px 8px 8px 3px",
                        padding: "9px 8px", textAlign: "left",
                        fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 11, lineHeight: 1.15,
                        background: b.bg, color: b.ink,
                        boxShadow: "0 8px 16px -10px rgba(51,41,31,.5)",
                        transition: "transform .18s ease",
                        overflow: "hidden",
                        display: "block",
                      }}
                    >
                      {b.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
