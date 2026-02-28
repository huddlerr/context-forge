import { useState } from "react";
import { INTEGRATIONS } from "../data/integrations";
import { LS } from "../data/localStorage";

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
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(560px, 92vw)", maxHeight: "80vh", background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>Integrations</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Connect your tools to export scaffolds</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
          {INTEGRATIONS.map(int => {
            const cfg = integrations[int.id] || {};
            const connected = int.fields.every(f => cfg[f.key]?.trim());
            const tr = testResult[int.id];
            return (
              <div key={int.id} style={{ marginBottom: 20, padding: 16, borderRadius: 12, border: `1px solid ${connected ? int.color + "33" : "rgba(255,255,255,0.06)"}`, background: connected ? int.color + "08" : "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{int.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{int.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{int.desc}</div>
                  </div>
                  {connected && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: tr === "success" ? "rgba(22,163,74,0.2)" : tr === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)", color: tr === "success" ? "#4ade80" : tr === "error" ? "#ef4444" : "rgba(255,255,255,0.4)" }}>
                      {tr === "success" ? "✓ Connected" : tr === "error" ? "✗ Failed" : "Configured"}
                    </span>
                  )}
                </div>
                {int.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={cfg[f.key] || ""}
                      onChange={e => update(int.id, f.key, e.target.value)}
                      placeholder={f.ph}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", outline: "none" }}
                    />
                  </div>
                ))}
                {connected && (
                  <button onClick={() => testConnection(int.id)} disabled={testing === int.id}
                    style={{ marginTop: 4, padding: "6px 14px", borderRadius: 6, border: "none", background: int.color + "22", color: int.color, fontSize: 11, fontWeight: 700, cursor: testing === int.id ? "wait" : "pointer" }}>
                    {testing === int.id ? "Testing..." : "Test Connection"}
                  </button>
                )}
              </div>
            );
          })}
          <div style={{ padding: 16, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>More integrations coming — Notion, Linear, CSV, GitHub</p>
          </div>
        </div>
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => { LS.set("integrations", integrations); onClose(); }}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#ff672a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}
