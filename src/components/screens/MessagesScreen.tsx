"use client";
import { useStore } from "@/store";

export default function MessagesScreen() {
  const { convos, convo, draft, books, pal, openConvo, setDraft, sendDraft, addToMyPal, openBook } = useStore();

  const activeConvo = convos.find((c) => c.id === convo);

  function previewText(c: typeof convos[0]) {
    const last = c.messages[c.messages.length - 1];
    if (!last) return "";
    if (last.book) return "📖 un livre partagé";
    return last.text || "";
  }

  return (
    <div style={{ padding: "24px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[18px]">
      <div
        style={{
          display: "grid", gridTemplateColumns: "280px 1fr",
          border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden",
          background: "var(--surface)", height: "calc(100vh - 190px)",
        }}
        className="max-[820px]:!grid-cols-1 max-[820px]:!h-auto"
      >
        {/* Conversation list */}
        <div
          style={{ borderRight: "1px solid var(--line)", overflowY: "auto" }}
          className="max-[820px]:flex max-[820px]:!border-r-0 max-[820px]:border-b max-[820px]:border-[var(--line)] max-[820px]:overflow-x-auto"
        >
          {convos.map((c) => (
            <button
              key={c.id}
              onClick={() => openConvo(c.id)}
              style={{
                width: "100%", display: "flex", gap: 12, padding: "16px 18px",
                textAlign: "left", borderBottom: "1px solid var(--line)",
                background: convo === c.id ? "var(--soft)" : "transparent",
                transition: "background .12s",
              }}
              className="max-[820px]:!min-w-[212px] max-[820px]:!border-b-0 max-[820px]:border-r max-[820px]:border-[var(--line)]"
              onMouseEnter={(e) => { if (convo !== c.id) (e.currentTarget as HTMLElement).style.background = "var(--surface2)"; }}
              onMouseLeave={(e) => { if (convo !== c.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{
                width: 36, height: 36, flexShrink: 0, borderRadius: "50%",
                background: c.avatarBg, color: "#fff",
                display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600,
              }}>
                {c.initial}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {previewText(c)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat area */}
        {activeConvo && (
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Chat header */}
            <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: activeConvo.avatarBg, color: "#fff",
                display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600,
              }}>
                {activeConvo.initial}
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{activeConvo.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  {activeConvo.id === "c1" ? "Lit Fourth Wing en ce moment" : "En ligne"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
              className="max-[820px]:min-h-[54vh]">
              {activeConvo.messages.map((m, i) => {
                const isMe = m.from === "me";
                const book = m.book ? books.find((b) => b.id === m.book) : null;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", gap: 9, alignItems: isMe ? "flex-end" : "flex-start" }}>
                      {m.text && (
                        <div style={{
                          padding: "11px 15px", fontSize: 14, lineHeight: 1.5,
                          background: isMe ? "var(--accent)" : "var(--surface2)",
                          color: isMe ? "#fff" : "var(--ink)",
                          borderRadius: isMe ? "16px 16px 5px 16px" : "16px 16px 16px 5px",
                        }}>
                          {m.text}
                        </div>
                      )}
                      {book && (
                        <div style={{
                          display: "flex", gap: 14, padding: 14,
                          border: "1px solid var(--line)", borderRadius: 16,
                          background: "var(--bg)", width: 330,
                        }}>
                          <div style={{
                            width: 58, height: 86, flexShrink: 0,
                            borderRadius: "3px 7px 7px 3px", padding: "8px 7px",
                            fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 10.5, lineHeight: 1.15,
                            background: book.bg, color: book.ink,
                          }}>
                            {book.title}
                          </div>
                          <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                            <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 15, lineHeight: 1.2 }}>
                              {book.title}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 3 }}>{book.author}</div>
                            <div style={{ fontSize: 11.5 }}>{"🌶".repeat(book.spice)}</div>
                            <button
                              onClick={() => addToMyPal(book.id)}
                              style={{
                                marginTop: "auto", alignSelf: "flex-start",
                                padding: "7px 12px", borderRadius: 9,
                                background: pal.includes(book.id) || book.lists.includes("PAL") ? "var(--surface2)" : "var(--soft)",
                                color: pal.includes(book.id) || book.lists.includes("PAL") ? "var(--muted)" : "var(--accent)",
                                fontSize: 12, fontWeight: 600,
                                cursor: pal.includes(book.id) || book.lists.includes("PAL") ? "default" : "pointer",
                              }}
                            >
                              {pal.includes(book.id) || book.lists.includes("PAL") ? "Dans ta PAL ✓" : "Ajouter à ma PAL"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div style={{ borderTop: "1px solid var(--line)", padding: "14px 22px", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendDraft()}
                placeholder="Écris quelque chose…"
                style={{
                  flex: 1, padding: "12px 14px",
                  border: "1px solid var(--line)", borderRadius: 11,
                  background: "var(--bg)", fontSize: 14, outline: "none",
                }}
              />
              <button
                onClick={sendDraft}
                style={{
                  padding: "12px 18px", borderRadius: 11,
                  background: "var(--accent)", color: "#161C2F", fontSize: 13.5, fontWeight: 600,
                }}
              >
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
