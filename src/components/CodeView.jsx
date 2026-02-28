import { useState, useMemo } from "react";

export function CodeView({ content, filename, compact }) {
  const [cp, setCp] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(content); setCp(true); setTimeout(() => setCp(false), 2000); };
  const html = useMemo(() => {
    if (!content) return "";
    return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\/.*$|#.*$)/gm, '<span style="color:#6b7280">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#f59e0b">$1</span>')
      .replace(/\b(export|import|interface|type|const|let|function|return|from|true|false|null)\b/g, '<span style="color:#c084fc">$1</span>')
      .replace(/\b(string|number|boolean|Date|void)\b/g, '<span style="color:#38bdf8">$1</span>');
  }, [content]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: compact ? "8px 12px" : "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff672a" }} />
          <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'JetBrains Mono',monospace" }}>{filename}</span>
        </div>
        <button onClick={copy} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: cp ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.04)", color: cp ? "#4ade80" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>
          {cp ? "✓ Copied" : "Copy"}</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: compact ? "8px 0" : "12px 0" }}>
        <pre style={{ margin: 0, padding: compact ? "0 12px" : "0 16px" }}>
          <code style={{ fontSize: compact ? 11 : 12, lineHeight: 1.7, fontFamily: "'JetBrains Mono','SF Mono',monospace", color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
