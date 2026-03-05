import { useState } from "react";
import { exportToAirtable } from "../exporters/airtable";
import { exportToSheets } from "../exporters/sheets";
import { exportBrainToAirtable } from "../exporters/airtableBrain";
import { exportBrainToSheets } from "../exporters/sheetsBrain";
import { downloadZip } from "../exporters/download";
import { copyAll } from "../exporters/clipboard";
import { colors, fontSizes, fontWeights, radii, shadows } from "../tokens";

/**
 * ExportMenu — works for both Project Scaffold and Second Brain modes.
 *
 * Props:
 *   show         {boolean}
 *   onClose      {() => void}
 *   files        {Record<string,string>}
 *   answers      {string[] | Record<string,string>}  — array for forge, object for brain
 *   integrations {Record<string, Record<string,string>>}
 *   mode         {"forge" | "brain"}
 *   onExport     {(target: string) => void}
 */
export function ExportMenu({ show, onClose, files, answers, integrations, mode = "forge", onExport }) {
  const [status, setStatus] = useState({});
  if (!show) return null;

  const isBrain = mode === "brain";
  const fileCount = Object.keys(files).filter(f => !f.endsWith(".gitkeep")).length;

  const downloadName = isBrain
    ? `second-brain-${(answers.name || "setup").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 30)}`
    : "context-forge-scaffold";

  const doExport = async (target) => {
    setStatus(p => ({ ...p, [target]: "loading" }));
    try {
      if (target === "clipboard") {
        copyAll(files);
        setStatus(p => ({ ...p, [target]: "done" }));
      } else if (target === "download") {
        downloadZip(files, downloadName);
        setStatus(p => ({ ...p, [target]: "done" }));
      } else if (target === "airtable") {
        if (isBrain) {
          await exportBrainToAirtable(integrations.airtable || {}, answers, files);
        } else {
          await exportToAirtable(integrations.airtable || {}, answers, files);
        }
        setStatus(p => ({ ...p, [target]: "done" }));
      } else if (target === "gsheets") {
        if (isBrain) {
          await exportBrainToSheets(integrations.gsheets || {}, answers, files);
        } else {
          await exportToSheets(integrations.gsheets || {}, answers, files);
        }
        setStatus(p => ({ ...p, [target]: "done" }));
      }
      setTimeout(() => setStatus(p => ({ ...p, [target]: null })), 3000);
      if (onExport) onExport(target);
    } catch {
      setStatus(p => ({ ...p, [target]: "error" }));
      setTimeout(() => setStatus(p => ({ ...p, [target]: null })), 3000);
    }
  };

  const atCfg = integrations.airtable || {};
  const gsCfg = integrations.gsheets || {};
  const atReady = !!(atCfg.apiKey && atCfg.baseId);
  const gsReady = !!(gsCfg.apiKey && gsCfg.sheetId);

  const targets = [
    {
      id: "clipboard",
      icon: "📋",
      name: "Copy All",
      desc: `Copy all ${fileCount} files to clipboard`,
      ready: true,
    },
    {
      id: "download",
      icon: "📦",
      name: "Download ZIP",
      desc: isBrain
        ? `Save as ${downloadName}.zip with full folder structure`
        : `Save as ${downloadName}.zip`,
      ready: true,
    },
    {
      id: "airtable",
      icon: "📊",
      name: "Airtable",
      desc: atReady
        ? isBrain
          ? `Push Second Brain profile to ${atCfg.tableId || "table"}`
          : `Push to ${atCfg.tableId || "Projects"}`
        : "Not configured — set up in Integrations",
      ready: atReady,
      color: colors.airtable,
    },
    {
      id: "gsheets",
      icon: "📗",
      name: "Google Sheets",
      desc: gsReady
        ? isBrain
          ? "Append Second Brain row (27 columns)"
          : "Append scaffold row"
        : "Not configured — set up in Integrations",
      ready: gsReady,
      color: colors.gsheets,
    },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: colors.overlay, backdropFilter: "blur(6px)" }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(440px, 90vw)",
          background: colors.bgPanel,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: shadows.modal,
        }}
      >
        <div style={{ padding: "20px 24px 12px" }}>
          <h2 style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold, margin: 0, color: colors.text }}>
            {isBrain ? "Export Second Brain" : "Export Scaffold"}
          </h2>
          <p style={{ fontSize: fontSizes.base, color: colors.textSubtle, margin: "4px 0 0" }}>
            {fileCount} files ready
            {isBrain && (
              <span style={{ marginLeft: 8, fontSize: fontSizes.sm, color: colors.textGhost }}>
                · ZIP preserves full folder structure
              </span>
            )}
          </p>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          {targets.map(t => {
            const st = status[t.id];
            const isDone = st === "done";
            const isErr = st === "error";
            const isLoading = st === "loading";
            return (
              <button
                key={t.id}
                onClick={() => t.ready && !isLoading && doExport(t.id)}
                disabled={!t.ready || isLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "14px 16px", marginBottom: 6,
                  background: isDone ? "rgba(22,163,74,0.1)" : isErr ? "rgba(239,68,68,0.1)" : t.ready ? colors.surfaceSubtle : "rgba(255,255,255,0.01)",
                  border: `1px solid ${isDone ? colors.successBg : isErr ? colors.errorBg : colors.border}`,
                  borderRadius: radii["2xl"],
                  cursor: t.ready && !isLoading ? "pointer" : "default",
                  opacity: t.ready ? 1 : 0.4,
                  textAlign: "left",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {isDone ? "✓" : isErr ? "✗" : isLoading ? "⏳" : t.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, color: isDone ? colors.successLight : isErr ? colors.error : colors.text }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: fontSizes.md, color: isDone ? colors.successLight : isErr ? colors.error : "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {isDone ? "Done!" : isErr ? "Failed — check Integrations settings" : isLoading ? "Exporting…" : t.desc}
                  </div>
                </div>
                {!t.ready && <span style={{ fontSize: fontSizes.sm, color: colors.textFaint, flexShrink: 0 }}>Setup →</span>}
              </button>
            );
          })}
        </div>
        {isBrain && (
          <div style={{ padding: "0 24px 16px" }}>
            <p style={{ margin: 0, fontSize: fontSizes.sm, color: colors.textGhost, lineHeight: 1.5 }}>
              <strong style={{ color: colors.textFaint }}>Airtable/Sheets tip:</strong> Create a table with columns for each of the 24 onboarding fields (Name, Role, Timezone…). The exporter maps each answer to its own column.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
