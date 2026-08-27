"use client";

export default function ActivityScreen() {
  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      <h1
        style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)",
          fontWeight: 400, fontSize: 25, letterSpacing: ".02em",
          margin: "0 0 24px",
        }}
      >
        Activité
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15 }}>
        Le fil de la communauté arrive bientôt.
      </p>
    </div>
  );
}
