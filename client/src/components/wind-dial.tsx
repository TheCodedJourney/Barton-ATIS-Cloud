// Runway numbers are magnetic and rounded to 10°, reported wind is true:
// good for a glance, not for a performance calculation.
export function windComponents(windDir: number, speed: number, runway: string) {
  const rel = ((windDir - parseInt(runway, 10) * 10) * Math.PI) / 180;
  return { head: Math.round(speed * Math.cos(rel)), cross: Math.round(speed * Math.sin(rel)) };
}

export function WindDial({ windDir, runway }: { windDir: number | null; runway: string | null }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-44 w-44 shrink-0"
      role="img"
      aria-label={`Wind ${windDir === null ? "variable" : `from ${windDir} degrees`}${runway ? `, runway ${runway} in use` : ""}`}
    >
      <circle cx="100" cy="100" r="86" className="fill-muted/50 stroke-border" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="100" y1="14" x2="100" y2={i % 3 ? 20 : 26} transform={`rotate(${i * 30} 100 100)`} className="stroke-muted-foreground" strokeWidth="2" />
      ))}
      {([["N", 100, 42], ["E", 163, 105], ["S", 100, 168], ["W", 37, 105]] as const).map(([c, x, y]) => (
        <text key={c} x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-[13px] font-semibold">{c}</text>
      ))}
      {runway && (
        <g transform={`rotate(${parseInt(runway, 10) * 10} 100 100)`}>
          <rect x="90" y="48" width="20" height="104" rx="3" className="fill-foreground/80" />
          <path d="M100 58v84" className="stroke-background" strokeWidth="2" strokeDasharray="7 7" />
          {/* landing direction */}
          <path d="M94 62l6-9 6 9z" className="fill-background" />
        </g>
      )}
      {windDir !== null && (
        <g transform={`rotate(${windDir} 100 100)`} className="transition-transform duration-700">
          <path d="M100 6v34" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
          <path d="M90 36l10 16 10-16z" fill="#f97316" />
        </g>
      )}
    </svg>
  );
}
