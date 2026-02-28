import { useState } from "react";
import { INTEGRATIONS } from "../data/integrations";
import { LS } from "../data/localStorage";
import { colors, fonts, fontSizes, fontWeights, radii, shadows } from "../tokens";

export function SettingsPanel({ show, onClose, integrations, setIntegrations }) {
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState({});

  if (!show) return null;

  const update = (intId, field, value) => {
    setIntegrations(prev => ({ ...prev, [intId]: { ...prev[intId], [field]: value } }));
  };

  const testConnection = async (intId) => {
    setTesting(intId);
    setTestResult(prev => ({ ...prev, [intId]: null }));
    try {
      const cfg = integrations[intId] || {};
      if (intId === "airtable") {
        const res = await fetch(`https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableId || "Projects")}?maxRecords=1`, {
          headers: { Authorization: `Bearer ${cfg.apiKey}` },
        });
        if (res.ok) setTestResult(prev => ({ ...prev, [intId]: "success" }));
        else throw new Error(`${res.status}`);
      } else if (intId === "gsheets") {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.sheetId}?key=${cfg.apiKey}&fields=properties.title`);
        if (res.ok) setTestResult(prev => ({ ...prev, [intId]: "success" }));
        else throw new Error(`${res.status}`);
      }
    } catch (e) {
      setTestResult(prev => ({ ...prev, [intId]: "error" }));
    }
    setTesting(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: colors.overlayHeavy, backdropFilter: "blur(8px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(560px, 92vw)", maxHeight: "80vh", background: colors.bgPanel, border: `1px solid ${colors.borderLight}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: shadows.modal }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div>
            <h2 style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold, margin: 0, color: colors.text }}>Integrations</h2>
            <p style={{ fontSize: fontSizes.base, color: colors.textSubtle, margin: "4px 0 0" }}>Connect your tools to export scaffolds</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: radii.xl, border: `1px solid ${colors.borderMedium}`, background: "transparent", color: colors.textDimmed, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
          {INTEGRATIONS.map(int => {
            const cfg = integrations[int.id] || {};
            const connected = int.fields.every(f => cfg[f.key]?.trim());
            const tr = testResult[int.id];
            return (
              <div key={int.id} style={{ marginBottom: 20, padding: 16, borderRadius: radii["3xl"], border: `1px solid ${connected ? int.color + "33" : colors.border}`, background: connected ? int.color + "08" : colors.surfaceHover }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{int.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.text }}>{int.name}</div>
                    <div style={{ fontSize: fontSizes.md, color: colors.textSubtle }}>{int.desc}</div>
                  </div>
                  {connected && (
                    <span style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.bold, padding: "3px 10px", borderRadius: radii.base, background: tr === "success" ? colors.successBg : tr === "error" ? colors.errorBg : colors.surfaceLight, color: tr === "success" ? colors.successLight : tr === "error" ? colors.error : colors.textDimmed }}>
                      {tr === "success" ? "✓ Connected" : tr === "error" ? "✗ Failed" : "Configured"}
                    </span>
                  )}
                </div>
                {int.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={cfg[f.key] || ""}
                      onChange={e => update(int.id, f.key, e.target.value)}
                      placeholder={f.ph}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: radii.xl, border: `1px solid ${colors.borderLight}`, background: colors.surface, color: colors.text, fontSize: fontSizes.lg, fontFamily: fonts.mono, outline: "none" }}
                    />
                  </div>
                ))}
                {connected && (
                  <button onClick={() => testConnection(int.id)} disabled={testing === int.id}
                    style={{ marginTop: 4, padding: "6px 14px", borderRadius: radii.base, border: "none", background: int.color + "22", color: int.color, fontSize: fontSizes.md, fontWeight: fontWeights.bold, cursor: testing === int.id ? "wait" : "pointer" }}>
                    {testing === int.id ? "Testing..." : "Test Connection"}
                  </button>
                )}
              </div>
            );
          })}
          <div style={{ padding: 16, borderRadius: radii["3xl"], border: `1px dashed ${colors.borderLight}`, textAlign: "center" }}>
            <p style={{ fontSize: fontSizes.base, color: colors.textGhost, margin: 0 }}>More integrations coming — Notion, Linear, CSV, GitHub</p>
          </div>
        </div>
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${colors.border}`, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => { LS.set("integrations", integrations); onClose(); }}
            style={{ padding: "8px 20px", borderRadius: radii.xl, border: "none", background: colors.primary, color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, cursor: "pointer" }}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}
