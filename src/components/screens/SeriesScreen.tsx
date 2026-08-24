"use client";
import { useStore } from "@/store";

export default function SeriesScreen() {
  const { books, openBook } = useStore();

  const seriesBooks = books.filter((b) => b.series);

  const seriesMap = new Map<string, typeof books>();
  for (const book of seriesBooks) {
    const s = book.series!;
    if (!seriesMap.has(s)) seriesMap.set(s, []);
    seriesMap.get(s)!.push(book);
  }

  const series = [...seriesMap.entries()]
    .map(([name, tomes]) => ({
      name,
      tomes: [...tomes].sort((a, b) => (a.seriesNum ?? 9999) - (b.seriesNum ?? 9999)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  if (series.length === 0) {
    return (
      <div style={{ padding: "30px 38px", color: "var(--muted)", fontSize: 14 }}>
        Aucune saga dans ta bibliothèque. Renseigne le champ &laquo;&nbsp;Saga&nbsp;&raquo; dans la fiche d&apos;un livre pour commencer.
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 38px", maxWidth: 1100 }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 22, marginBottom: 28, letterSpacing: ".02em" }}>
        Mes sagas
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {series.map(({ name, tomes }) => {
          const read = tomes.filter((b) => b.lists.includes("Déjà lu")).length;
          const total = tomes.length;
          const pct = total > 0 ? Math.round((read / total) * 100) : 0;
          const today = new Date();

          return (
            <div key={name} style={{ border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)", padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 17 }}>{name}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{read}&thinsp;/&thinsp;{total} tome{total > 1 ? "s" : ""} lu{read > 1 ? "s" : ""}</div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: "var(--surface2)", marginBottom: 18, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width .4s" }} />
              </div>

              {/* Tomes */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {tomes.map((book) => {
                  const isRead = book.lists.includes("Déjà lu");
                  const isReading = book.lists.includes("En cours");
                  const isUnreleased = !!(book.releaseDate && new Date(book.releaseDate) > today);

                  return (
                    <button
                      key={book.id}
                      onClick={() => openBook(book.id)}
                      style={{ display: "flex", flexDirection: "column", gap: 7, width: 86, cursor: "pointer", background: "none", border: "none", padding: 0, textAlign: "left" }}
                    >
                      {/* Mini cover */}
                      <div style={{
                        width: 86, height: 124,
                        borderRadius: "3px 8px 8px 3px",
                        background: book.bg,
                        color: book.ink,
                        overflow: "hidden",
                        position: "relative",
                        opacity: isUnreleased ? 0.55 : 1,
                        boxShadow: isRead
                          ? "0 0 0 2px var(--accent), 0 6px 18px rgba(0,0,0,.25)"
                          : isReading
                          ? "0 0 0 2px #E0B84A, 0 6px 18px rgba(0,0,0,.25)"
                          : "0 4px 14px rgba(0,0,0,.2)",
                        transition: "transform .12s, box-shadow .12s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                      >
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ padding: "8px 7px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <span style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 9, lineHeight: 1.3 }}>{book.title}</span>
                            <span style={{ fontSize: 7.5, opacity: 0.7, textTransform: "uppercase", letterSpacing: ".1em" }}>{book.author}</span>
                          </div>
                        )}

                        {isRead && (
                          <div style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", color: "#161C2F", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>✓</div>
                        )}
                        {isReading && !isRead && (
                          <div style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: "#E0B84A", color: "#161C2F", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700 }}>…</div>
                        )}
                        {isUnreleased && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(14,10,6,.75)", padding: "5px 5px 4px", textAlign: "center" }}>
                            <div style={{ fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>À paraître</div>
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>
                        {book.seriesNum != null ? `Tome ${book.seriesNum}` : "—"}
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.35, color: "var(--ink)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {book.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
