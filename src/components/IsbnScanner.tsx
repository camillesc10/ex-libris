"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onFound: (isbn: string) => void;
  onClose: () => void;
}

export default function IsbnScanner({ onFound, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Initialisation caméra…");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animId: number;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("Pointe vers un code-barres ISBN…");

        if (!("BarcodeDetector" in window)) {
          setError("BarcodeDetector non supporté sur ce navigateur. Utilise Chrome sur Android ou l'app.");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({ formats: ["ean_13", "ean_8", "isbn"] });

        const scan = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            for (const b of barcodes) {
              const v: string = b.rawValue;
              if (/^97[89]\d{10}$/.test(v) || /^\d{10}$/.test(v)) {
                stopped = true;
                stream?.getTracks().forEach((t) => t.stop());
                onFound(v);
                return;
              }
            }
          } catch { /* ignore per-frame errors */ }
          animId = requestAnimationFrame(scan);
        };
        animId = requestAnimationFrame(scan);
      } catch (e) {
        setError(`Caméra inaccessible : ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(animId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onFound]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80, background: "rgba(8,11,20,.9)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{ fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 20, color: "var(--ink)" }}>
        Scanner un ISBN
      </div>

      {error ? (
        <div style={{ maxWidth: 360, textAlign: "center", color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
          {error}
        </div>
      ) : (
        <div style={{ position: "relative", width: 300, height: 200, borderRadius: 16, overflow: "hidden", border: "2px solid var(--accent)" }}>
          <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Viewfinder overlay */}
          <div style={{
            position: "absolute", inset: 0, border: "40px solid rgba(8,11,20,.5)",
            boxSizing: "border-box",
          }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 220, height: 2, background: "rgba(224,184,74,.7)", boxShadow: "0 0 8px 2px rgba(224,184,74,.4)" }} />
          </div>
        </div>
      )}

      <div style={{ fontSize: 13, color: "var(--muted)" }}>{status}</div>

      <button
        onClick={onClose}
        style={{ padding: "10px 22px", borderRadius: 11, background: "var(--surface2)", fontSize: 14, color: "var(--ink)" }}
      >
        Annuler
      </button>
    </div>
  );
}
