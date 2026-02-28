import { useState, useMemo } from "react";
import { colors, fonts, fontSizes, fontWeights, radii } from "../tokens";

export function CodeView({ content, filename, compact }) {
  const [cp, setCp] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(content); setCp(true); setTimeout(() => setCp(false), 2000); };
  const html = useMemo(() => {
    if (!content) return "";
    return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\/.*$|#.*$)/gm, `<span style="color:${colors.syntaxComment}">$1</span>`)
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, `<span style="color:${colors.syntaxString}">$1</span>`)
      .replace(/\b(export|import|interface|type|const|let|function|return|from|true|false|null)\b/g, `<span style="color:${colors.syntaxKeyword}">$1</span>`)
      .replace(/\b(string|number|boolean|Date|void)\b/g, `<span style="color:${colors.syntaxType}">$1</span>`);
  }, [content]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: compact ? "8px 12px" : "10px 16px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.primary }} />
          <span style={{ fontSize: compact ? fontSizes.md : fontSizes.base, fontWeight: fontWeights.semibold, color: colors.textSecondary, fontFamily: fonts.mono }}>{filename}</span>
        </div>
        <button onClick={copy} style={{ padding: "4px 12px", borderRadius: radii.base, border: `1px solid ${colors.borderMedium}`, background: cp ? colors.successBg : colors.surface, color: cp ? colors.successLight : colors.textMuted, fontSize: fontSizes.md, fontWeight: fontWeights.semibold, cursor: "pointer", fontFamily: fonts.mono }}>
          {cp ? "✓ Copied" : "Copy"}</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: compact ? "8px 0" : "12px 0" }}>
        <pre style={{ margin: 0, padding: compact ? "0 12px" : "0 16px" }}>
          <code style={{ fontSize: compact ? fontSizes.md : fontSizes.base, lineHeight: 1.7, fontFamily: fonts.mono, color: colors.textCode, whiteSpace: "pre-wrap", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
