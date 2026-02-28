import { colors, fonts, fontWeights } from "../tokens";

export function Ring({ value, size = 40, stroke = 3.5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const col = value >= 0.8 ? colors.success : value >= 0.5 ? colors.warning : value > 0 ? colors.error : colors.borderMedium;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.borderLight} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - value * c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={col}
        fontSize={size * 0.28} fontWeight={fontWeights.bold} fontFamily={fonts.mono}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{Math.round(value * 100)}</text>
    </svg>
  );
}
