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
      <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 28px" }}>
        Cette fonctionnalité permettra de comparer ta bibliothèque avec celle d&apos;une amie
        à partir de son code de partage. Elle arrive bientôt.
      </p>
      <div style={{
        border: "1px solid var(--line)", borderRadius: 16,
        background: "var(--surface)", padding: "20px 22px",
        fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6,
      }}>
        En attendant, tu peux partager tes listes depuis l&apos;onglet <strong style={{ color: "var(--ink)" }}>Mes listes</strong> — chaque liste personnalisée a un bouton « Partager la liste » qui génère un code.
      </div>
    </div>
  );
}
