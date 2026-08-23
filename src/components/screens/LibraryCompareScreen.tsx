"use client";

export default function LibraryCompareScreen() {
  return (
    <div style={{ padding: "30px 38px", maxWidth: 600 }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">
      <h1 style={{
        fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400,
        fontSize: 26, letterSpacing: ".03em", margin: "0 0 12px",
      }}>
        Comparaison de bibliothèques
      </h1>
      <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
        Cette fonctionnalité permettra de comparer ta bibliothèque avec celle d&apos;une amie
        à partir de son code de partage. Elle arrive bientôt.
      </p>
    </div>
  );
}
