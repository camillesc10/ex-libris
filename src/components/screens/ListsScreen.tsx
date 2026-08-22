"use client";
import { useStore } from "@/store";

export default function ListsScreen() {
  const { books, lists, newList, setNewList, addList, openBook } = useStore();

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
            background: "var(--accent)", color: "#fff", fontSize: 13.5, fontWeight: 600,
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
          return (
            <div
              key={l.name}
              style={{ border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface)", padding: 20 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: l.dot, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 19 }}>{l.name}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{count} livre(s)</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16 }}>{l.desc}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", minHeight: 104 }}>
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
                        width: 66, height: 98, borderRadius: "3px 8px 8px 3px",
                        padding: "9px 8px", textAlign: "left",
                        fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 11, lineHeight: 1.15,
                        background: b.bg, color: b.ink,
                        boxShadow: "0 8px 16px -10px rgba(51,41,31,.5)",
                        transition: "transform .18s ease",
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
