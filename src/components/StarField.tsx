"use client";
import { useEffect, useRef } from "react";

export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    c.style.width = W + "px";
    c.style.height = H + "px";
    ctx.scale(dpr, dpr);

    // Deterministic pseudo-random with fixed seed
    let seed = 12345;
    function rand() {
      seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
      return seed / 0x7fffffff;
    }

    for (let i = 0; i < 320; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 0.7 + rand() * 3.2;
      const a = 0.16 + rand() * 0.54;
      const isGold = rand() < 0.55;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isGold
        ? `rgba(255,244,206,${a.toFixed(2)})`
        : `rgba(226,236,255,${a.toFixed(2)})`;
      ctx.fill();
    }
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
