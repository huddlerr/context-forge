import { useState } from "react";
import { exportToAirtable } from "../exporters/airtable";
import { exportToSheets } from "../exporters/sheets";
import { downloadZip } from "../exporters/download";
import { copyAll } from "../exporters/clipboard";
import { colors, fontSizes, fontWeights, radii, shadows } from "../tokens";

export function ExportMenu({ show, onClose, files, answers, integrations, onExport }) {
  const [status, setStatus] = useState({});

  if (!show) return null;

  const doExport = async (target) => {
    setStatus(p => ({ ...p, [target]: "loading" }));
    try {
      if (target === "clipboard") { copyAll(files); setStatus(p => ({ ...p, [target]: "done" })); }
      else if (target === "download") { downloadZip(files); setStatus(p => ({ ...p, [target]: "done" })); }
      else if (target === "airtable") { await exportToAirtable(integrations.airtable || {}, answers, files); setStatus(p => ({ ...p, [target]: "done" })); }
      else if (target === "gsheets") { await exportToSheets(integrations.gsheets || {}, answers, files); setStatus(p => ({ ...p, [target]: "done" })); }
      setTimeout(() => setStatus(p => ({ ...p, [target]: null })), 3000);
      if (onExport) onExport(target);
    } catch (e) {
      setStatus(p => ({ ...p, [target]: "error" }));
      setTimeout(() => setStatus(p => ({ ...p, [target]: null })), 3000);
    }
  };

  const atCfg = integrations.airtable || {};
  const gsCfg = integrations.gsheets || {};
  const atReady = atCfg.apiKey && atCfg.baseId;
  const gsReady = gsCfg.apiKey && gsCfg.sheetId;

  const targets = [
    { id: "clipboard", icon: "📋", name: "Copy All", desc: "All files to clipboard", ready: true },
    { id: "download", icon: "💾", name: "Download", desc: "Save as text bundle", ready: true },
    { id: "airtable", icon: "📊", name: "Airtable", desc: atReady ? "Push to " + (atCfg.tableId || "Projects") : "Not configured", ready: atReady, color: colors.airtable },
    { id: "gsheets", icon: "📗", name: "Google Sheets", desc: gsReady ? "Append row" : "Not configured", ready: gsReady, color: colors.gsheets },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: colors.overlay, backdropFilter: "blur(6px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(420px, 90vw)", background: colors.bgPanel, border: `1px solid ${colors.borderLight}`, borderRadius: 16, overflow: "hidden", boxShadow: shadows.modal }}>
        <div style={{ padding: "20px 24px 12px" }}>
          <h2 style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold, margin: 0, color: colors.text }}>Export Scaffold</h2>
          <p style={{ fontSize: fontSizes.base, color: colors.textSubtle, margin: "4px 0 0" }}>{Object.keys(files).length} files ready</p>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          {targets.map(t => {
            const st = status[t.id];
            return (
              <button key={t.id} onClick={() => t.ready && doExport(t.id)} disabled={!t.ready || st === "loading"}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", marginBottom: 6, background: st === "done" ? "rgba(22,163,74,0.1)" : st === "error" ? "rgba(239,68,68,0.1)" : t.ready ? colors.surfaceSubtle : "rgba(255,255,255,0.01)", border: `1px solid ${st === "done" ? colors.successBg : st === "error" ? colors.errorBg : colors.border}`, borderRadius: radii["2xl"], cursor: t.ready ? "pointer" : "default", opacity: t.ready ? 1 : 0.4, textAlign: "left" }}>
                <span style={{ fontSize: 22 }}>{st === "done" ? "✓" : st === "error" ? "✗" : t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, color: st === "done" ? colors.successLight : st === "error" ? colors.error : colors.text }}>{t.name}</div>
                  <div style={{ fontSize: fontSizes.md, color: st === "done" ? colors.successLight : st === "error" ? colors.error : "rgba(255,255,255,0.3)" }}>
                    {st === "done" ? "Done!" : st === "error" ? "Failed — check settings" : st === "loading" ? "Exporting..." : t.desc}
                  </div>
                </div>
                {!t.ready && <span style={{ fontSize: fontSizes.sm, color: colors.textFaint }}>Setup →</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
