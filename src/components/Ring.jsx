export function Ring({ value, size = 40, stroke = 3.5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const col = value >= 0.8 ? "#16a34a" : value >= 0.5 ? "#f59e0b" : value > 0 ? "#ef4444" : "rgba(255,255,255,0.1)";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - value * c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={col}
        fontSize={size * 0.28} fontWeight="700" fontFamily="'JetBrains Mono',monospace"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{Math.round(value * 100)}</text>
    </svg>
  );
}
