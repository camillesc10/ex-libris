"use client";
import { useStore } from "@/store";

export default function InstallBanner() {
  const { showTip, dismissTip } = useStore();
  if (!showTip) return null;
  return (
    <div
      className="hidden max-[820px]:flex"
      style={{
        position: "fixed", left: 12, right: 12,
        bottom: "calc(80px + env(safe-area-inset-bottom))",
        zIndex: 55, alignItems: "center", gap: 12, padding: "13px 15px",
        borderRadius: 16, background: "var(--ink)", color: "var(--bg)",
        fontSize: 12.5, lineHeight: 1.45,
        boxShadow: "0 18px 34px -18px rgba(0,0,0,.55)",
      }}
    >
      <span style={{ flex: 1 }}>
        Garde Ex-Libris sur ton téléphone : <strong>Partager</strong> puis <strong>Sur l&apos;écran d&apos;accueil</strong>.
      </span>
      <button
        onClick={dismissTip}
        style={{ padding: "9px 12px", borderRadius: 11, background: "rgba(255,255,255,.16)", fontSize: 12 }}
      >
        OK
      </button>
    </div>
  );
}
