"use client";
import { useStore } from "@/store";
import { COVER_PALETTE } from "@/store/data";

const HERO_COVERS = [
  { title: "Une cour de roses et d'épines", author: "Sarah J. Maas", h: 150, ...{ bg: COVER_PALETTE[0][0], ink: COVER_PALETTE[0][1] } },
  { title: "Fourth Wing", author: "Rebecca Yarros", h: 178, ...{ bg: COVER_PALETTE[1][0], ink: COVER_PALETTE[1][1] } },
  { title: "Le Prince cruel", author: "Holly Black", h: 132, ...{ bg: COVER_PALETTE[2][0], ink: COVER_PALETTE[2][1] } },
  { title: "La Chanson d'Achille", author: "Madeline Miller", h: 168, ...{ bg: COVER_PALETTE[3][0], ink: COVER_PALETTE[3][1] } },
  { title: "Beach Read", author: "Emily Henry", h: 144, ...{ bg: COVER_PALETTE[4][0], ink: COVER_PALETTE[4][1] } },
];

export default function AuthPage() {
  const { mode, form, authError, setFormField, submitAuth, toggleAuth, theme } = useStore();
  const isSignup = mode === "signup";

  const kicker = isSignup ? "Nouvelle étagère" : "Bon retour";
  const title = isSignup ? "Crée ta bibliothèque" : "Retrouve tes livres";
  const sub = isSignup
    ? "Ta bibliothèque, tes notes et tes tropes : rien n'est partagé sans que tu le décides."
    : "Là où tu t'étais arrêtée, avec les notes de tes ami·es.";
  const cta = isSignup ? "Créer mon compte" : "Se connecter";
  const switchLabel = isSignup ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? En créer un";

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2.5 p-6">
        <div style={{ width: 28, height: 28, borderRadius: 9, background: "var(--accent)" }} />
        <span style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 21, letterSpacing: "-0.01em" }}>
          Marque-page
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          minHeight: "100vh",
        }}
        className="max-[820px]:grid-cols-1!"
      >
        {/* Left art column */}
        <div
          className="hidden md:flex"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--surface2)",
            padding: "56px 60px",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 23, letterSpacing: "-0.01em" }}>
              Marque-page
            </span>
          </div>

          <div style={{ maxWidth: 430 }}>
            <p style={{
              fontFamily: "var(--font-newsreader, Newsreader, serif)",
              fontSize: 44, lineHeight: 1.12, letterSpacing: "-0.02em",
              margin: "0 0 18px", textWrap: "pretty",
            }}>
              Ta bibliothèque, tes pépites, et les ami·es qui lisent avec toi.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted)", margin: 0, maxWidth: 380, textWrap: "pretty" }}>
              Range tes livres sur une étagère qui te ressemble, note le niveau de piment, garde tes tropes préférés à portée de main — et lance une lecture à deux sans le moindre spoiler.
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", height: 180 }}>
            {HERO_COVERS.map((c) => (
              <div
                key={c.title}
                style={{
                  width: 96, borderRadius: "4px 10px 10px 4px",
                  padding: "14px 12px", display: "flex", flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 12px 24px -12px rgba(51,41,31,.4)",
                  background: c.bg, color: c.ink, height: c.h,
                }}
              >
                <div style={{ fontFamily: "var(--font-newsreader, Newsreader, serif)", fontSize: 13, lineHeight: 1.2 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.7 }}>
                  {c.author}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form column */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}
          className="max-[820px]:!px-5 max-[820px]:!py-8 max-[820px]:!items-start">
          <div style={{ width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 14 }}>
              {kicker}
            </div>
            <h1 style={{
              fontFamily: "var(--font-newsreader, Newsreader, serif)",
              fontWeight: 400, fontSize: 34, letterSpacing: "-0.02em", margin: "0 0 8px",
            }}>
              {title}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 30px" }}>{sub}</p>

            {isSignup && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 7 }}>
                  Pseudo
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setFormField("name", e.target.value)}
                  placeholder="lila.lit"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>E-mail</label>
              <input
                value={form.email}
                onChange={(e) => setFormField("email", e.target.value)}
                placeholder="toi@exemple.fr"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                value={form.pass}
                onChange={(e) => setFormField("pass", e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && submitAuth()}
                style={inputStyle}
              />
            </div>

            {authError && (
              <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 12 }}>{authError}</div>
            )}

            <button
              onClick={submitAuth}
              style={{
                width: "100%", marginTop: 12, padding: 14, borderRadius: 11,
                background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: ".01em",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.07)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = ""; }}
            >
              {cta}
            </button>

            <button
              onClick={toggleAuth}
              style={{ width: "100%", marginTop: 14, fontSize: 13.5, color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              {switchLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, letterSpacing: ".06em",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 14px", border: "1px solid var(--line)",
  borderRadius: 11, background: "var(--surface)", fontSize: 15, outline: "none",
};
