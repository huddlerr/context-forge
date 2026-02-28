import { QS } from "../data/questions";
import { detectStack } from "../engines/detectStack";
import { detectAuth } from "../engines/detectAuth";
import { detectIntegrations } from "../engines/detectIntegrations";
import { parseDataModel } from "../engines/parseDataModel";
import { parseFlow } from "../engines/parseFlow";
import { colors, fonts, fontSizes, fontWeights, radii, animations } from "../tokens";

export function Badges({ answers, qi, compact }) {
  const q = QS[qi], ans = answers[qi] || "";
  if (!q.smart || ans.trim().length < 3) return null;
  let d = [];
  if (q.id === 3) d = Object.keys(detectStack(ans).detected);
  else if (q.id === 4) d = parseDataModel(ans).map(e => e.name);
  else if (q.id === 5) d = parseFlow(ans).map(s => `Step ${s.number}`);
  else if (q.id === 7) d = detectAuth(ans).map(p => p.p);
  else if (q.id === 8) d = detectIntegrations(ans).map(i => i.n);
  if (!d.length) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", animation: animations.fadeIn }}>
      <span style={{ fontSize: compact ? fontSizes.xs : fontSizes.sm, color: "rgba(255,255,255,0.3)", fontWeight: fontWeights.semibold, lineHeight: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Detected:</span>
      {d.map((item, i) => (
        <span key={i} style={{ fontSize: compact ? fontSizes.sm : fontSizes.md, fontWeight: fontWeights.semibold, color: colors.primaryMuted, background: "rgba(255,103,42,0.12)", border: "1px solid rgba(255,103,42,0.2)", padding: compact ? "1px 6px" : "2px 8px", borderRadius: radii.base, fontFamily: fonts.mono, display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: colors.primary }} />{item}
        </span>
      ))}
    </div>
  );
}
