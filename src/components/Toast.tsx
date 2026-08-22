"use client";
import { useStore } from "@/store";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      className="animate-up"
      style={{
        position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)",
        zIndex: 80, padding: "13px 20px", borderRadius: 14,
        background: "var(--ink)", color: "var(--bg)", fontSize: 13.5,
        boxShadow: "0 18px 34px -18px rgba(51,41,31,.6)",
        whiteSpace: "nowrap",
      }}
    >
      {toast}
    </div>
  );
}
