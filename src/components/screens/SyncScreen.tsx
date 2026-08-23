"use client";
import { useStore } from "@/store";
import { FRIENDS, CHECKPOINTS } from "@/store/data";

export default function SyncScreen() {
  const {
    books, readBook, readers, invites, myPage, pageInput, notes, notePage, noteText,
    flow,
    setReadBook, toggleInvite, launchRead, setPageInput, declarePage,
    setNotePage, setNoteText, addNote, setFlow,
  } = useStore();

  const rb = books.find((b) => b.id === readBook);
  const totalPages = rb?.pages ?? 640;

  const launchEnabled = invites.length > 0;
  const launchLabel = invites.length === 0
    ? "Choisis au moins un·e invité·e"
    : `Lire ensemble à ${invites.length === 1 ? "deux" : invites.length + 1}`;
  const launchHint = rb && invites.length > 0
    ? `« ${rb.title} » · ${invites.join(", ")} recevront l'invitation.`
    : "";

  const flowHint = flow === "fil"
    ? "Les notes scellées restent cachées tant que tu n'as pas atteint la page."
    : "Chaque jalon révèle un fil de discussion commun.";

  const allProgress = [
    { who: "Moi", page: myPage, total: totalPages, color: "var(--accent)" },
    ...readers.map((r) => ({ who: r.name, page: r.page, total: totalPages, color: r.color })),
  ];

  const progressHeader = readers.length === 1
    ? `Lecture à deux avec ${readers[0].name}`
    : `Lecture à ${readers.length + 1} avec ${readers.map((r) => r.name).join(", ")}`;

  const unlockHint = myPage < totalPages
    ? `Prochaine note scellée : page ${notes.find((n) => n.page > myPage)?.page ?? "—"}`
    : "Tout est débloqué.";

  return (
    <div style={{ padding: "30px 38px", maxWidth: 1080 }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      {/* Setup card */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 20, background: "var(--surface)", padding: "22px 24px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 20 }}>Lire ensemble</span>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Un livre, une ou plusieurs personnes — les notes restent scellées page par page pour chacun·e.</span>
        </div>

        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 9 }}>
          Le livre
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
          {books.slice(0, 8).map((b) => {
            const active = readBook === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setReadBook(b.id)}
                style={{
                  padding: "7px 13px", borderRadius: 999, fontSize: 12.5,
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  background: active ? "var(--soft)" : "transparent",
                  color: active ? "var(--accent)" : "var(--ink)",
                }}
              >
                {b.title}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 9 }}>
          Les invité·es
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {FRIENDS.map((f) => {
            const invited = invites.includes(f.name);
            return (
              <button
                key={f.name}
                onClick={() => toggleInvite(f.name)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "7px 14px", borderRadius: 999, fontSize: 12.5,
                  border: `1px solid ${invited ? f.color : "var(--line)"}`,
                  background: invited ? "var(--soft)" : "transparent",
                  color: invited ? "var(--accent)" : "var(--ink)",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.color }} />
                {f.name}{invited ? " ✓" : ""}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <button
            onClick={launchEnabled ? launchRead : undefined}
            style={{
              padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 600,
              background: launchEnabled ? "var(--accent)" : "var(--surface2)",
              color: launchEnabled ? "#fff" : "var(--muted)",
              cursor: launchEnabled ? "pointer" : "default",
            }}
          >
            {launchLabel}
          </button>
          {launchHint && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{launchHint}</span>}
        </div>
      </div>

      {/* Flow tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        {([
          { key: "fil", label: "Fil scellé page par page" },
          { key: "jalons", label: "Jalons de chapitre" },
        ] as const).map((f) => {
          const active = flow === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFlow(f.key)}
              style={{
                padding: "8px 15px", borderRadius: 999, fontSize: 13,
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                background: active ? "var(--soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink)",
              }}
            >
              {f.label}
            </button>
          );
        })}
        <span style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: 6 }}>{flowHint}</span>
      </div>

      {/* Progress card */}
      {rb && (
        <div
          style={{ display: "flex", gap: 26, padding: 24, border: "1px solid var(--line)", borderRadius: 20, background: "var(--surface)", marginBottom: 26 }}
          className="max-[820px]:flex-wrap max-[820px]:!p-[18px]"
        >
          <div style={{
            width: 104, height: 154, flexShrink: 0, borderRadius: "4px 10px 10px 4px",
            padding: "13px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between",
            background: rb.bg, color: rb.ink,
            boxShadow: "0 12px 22px -12px rgba(51,41,31,.45)",
          }}>
            <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 14, lineHeight: 1.18 }}>{rb.title}</div>
            <div style={{ fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.72 }}>{rb.author}</div>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>J&apos;en suis page</span>
              <input
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
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

      {/* Flow: Fil */}
      {flow === "fil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {notes.map((n) => {
            const unlocked = n.page <= myPage;
            const avatarBg = n.who === "Moi" ? "var(--accent)" : (FRIENDS.find((f) => f.name === n.who)?.color ?? "#999");
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
                          width: 22, height: 22, borderRadius: "50%", background: avatarBg,
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

          {/* Composer */}
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ width: 76, flexShrink: 0, textAlign: "right", paddingTop: 13 }}>
              <input
                value={notePage}
                onChange={(e) => setNotePage(e.target.value)}
                style={{
                  width: 62, padding: "7px 8px", border: "1px solid var(--line)",
                  borderRadius: 9, background: "var(--surface)", fontSize: 13, textAlign: "center", outline: "none",
                }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", gap: 10 }}>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Laisse une note à cette page — elle restera scellée jusqu'à ce qu'elle y arrive."
                style={{
                  flex: 1, padding: "13px 15px", border: "1px solid var(--line)",
                  borderRadius: 14, background: "var(--surface)", fontSize: 14, outline: "none",
                }}
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

      {/* Flow: Jalons */}
      {flow === "jalons" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {CHECKPOINTS.map((c) => {
            const myPassed = myPage >= c.page;
            const allPassed = myPassed && readers.every((r) => r.page >= c.page);
            return (
              <div
                key={c.label}
                style={{
                  border: `1px solid ${allPassed ? "var(--accent)" : "var(--line)"}`,
                  borderRadius: 18,
                  background: allPassed ? "var(--soft)" : "var(--surface)",
                  padding: 20, display: "flex", flexDirection: "column", gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: allPassed ? "var(--accent)" : "var(--muted)" }}>
                    {c.kicker}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>jusqu&apos;à p. {c.page}</span>
                </div>
                <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 19, lineHeight: 1.2 }}>
                  {c.label}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{
                    padding: "5px 10px", borderRadius: 999, fontSize: 11.5,
                    background: myPassed ? "var(--soft)" : "var(--surface2)",
                    color: myPassed ? "var(--accent)" : "var(--muted)",
                  }}>
                    {myPassed ? "Toi ✓" : "Toi · en route"}
                  </span>
                  {readers.map((r) => (
                    <span
                      key={r.name}
                      style={{
                        padding: "5px 10px", borderRadius: 999, fontSize: 11.5,
                        background: r.page >= c.page ? "var(--soft)" : "var(--surface2)",
                        color: r.page >= c.page ? r.color : "var(--muted)",
                      }}
                    >
                      {r.page >= c.page ? `${r.name} ✓` : `${r.name} · en route`}
                    </span>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)" }}>
                  {allPassed
                    ? "Tout le monde est arrivé ici — le fil est ouvert."
                    : `${myPassed ? "Tu as dépassé ce jalon" : "Atteins la page pour déverrouiller"}.`}
                </div>
                <button
                  style={{
                    alignSelf: "flex-start", padding: "8px 13px", borderRadius: 10,
                    background: myPassed ? "var(--surface2)" : "var(--accent)",
                    color: myPassed ? "var(--muted)" : "#fff",
                    fontSize: 12.5, fontWeight: 600,
                    cursor: myPassed ? "default" : "pointer",
                  }}
                >
                  {myPassed ? "Ouvrir le fil" : "Je suis arrivée ici"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
