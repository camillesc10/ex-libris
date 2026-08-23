"use client";
import { useRef } from "react";
import { useStore } from "@/store";

export default function GoodreadsImport() {
  const { importGoodreads } = useStore();
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      if (csv) importGoodreads(csv);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
      border: "1px solid var(--line)", borderRadius: 16, background: "var(--surface)",
      marginBottom: 24,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 16, marginBottom: 4 }}>
          Importer depuis Goodreads
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
          Goodreads → Mon profil → Importer/Exporter → <strong style={{ color: "var(--ink)" }}>Exporter ma bibliothèque</strong> · puis dépose le fichier CSV ici.
        </div>
      </div>
      <input ref={ref} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
      <button
        onClick={() => ref.current?.click()}
        style={{
          flexShrink: 0, padding: "10px 18px", borderRadius: 11,
          background: "var(--soft)", color: "var(--accent)", fontSize: 13, fontWeight: 600,
        }}
      >
        Choisir le fichier CSV
      </button>
    </div>
  );
}
