interface Props {
  variant?: "mark" | "lockup";
  size?: number;
  mono?: boolean;
  className?: string;
}

export default function ExLibrisLogo({ variant = "mark", size = 28, mono = false, className }: Props) {
  if (variant === "lockup") {
    const markH = size;
    const markW = Math.round(size * (96 / 74));
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9 }} className={className}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 74" width={markW} height={markH} role="img" aria-label="Ex-Libris" aria-hidden="true">
          {mono ? (
            <g fill="currentColor">
              <rect x="12" y="23" width="18" height="44" rx="3" />
              <rect x="39" y="5" width="18" height="62" rx="3" opacity=".72" />
              <rect x="66" y="33" width="18" height="34" rx="3" opacity=".45" />
              <rect x="0" y="69" width="96" height="5" rx="2.5" />
            </g>
          ) : (
            <>
              <rect x="12" y="23" width="18" height="44" rx="3" fill="#F3EBD9" />
              <rect x="39" y="5" width="18" height="62" rx="3" fill="#E0B84A" />
              <rect x="66" y="33" width="18" height="34" rx="3" fill="#96A1BE" />
              <rect x="0" y="69" width="96" height="5" rx="2.5" fill="#E0B84A" />
            </>
          )}
        </svg>
        <span style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)",
          fontSize: Math.round(size * 0.57),
          letterSpacing: ".18em",
          textTransform: "uppercase" as const,
          lineHeight: 1,
        }}>
          Ex-Libris
        </span>
      </div>
    );
  }

  const markW = Math.round(size * (96 / 74));
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 74" width={markW} height={size} role="img" aria-label="Ex-Libris" className={className}>
      {mono ? (
        <g fill="currentColor">
          <rect x="12" y="23" width="18" height="44" rx="3" />
          <rect x="39" y="5" width="18" height="62" rx="3" opacity=".72" />
          <rect x="66" y="33" width="18" height="34" rx="3" opacity=".45" />
          <rect x="0" y="69" width="96" height="5" rx="2.5" />
        </g>
      ) : (
        <>
          <rect x="12" y="23" width="18" height="44" rx="3" fill="#F3EBD9" />
          <rect x="39" y="5" width="18" height="62" rx="3" fill="#E0B84A" />
          <rect x="66" y="33" width="18" height="34" rx="3" fill="#96A1BE" />
          <rect x="0" y="69" width="96" height="5" rx="2.5" fill="#E0B84A" />
        </>
      )}
    </svg>
  );
}
