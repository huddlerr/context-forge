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
 *   isUnlocked   {boolean}  — whether the access key has been validated
 *   onUnlock     {() => void}  — callback to open the UnlockModal
 *   onExport     {(target: string) => void}
 */
export function ExportMenu({ show, onClose, files, answers, integrations, mode = "forge", isUnlocked = false, onUnlock, onExport }) {
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
  const atConfigured = !!(atCfg.apiKey && atCfg.baseId);
  const gsConfigured = !!(gsCfg.apiKey && gsCfg.sheetId);

  // Airtable and Sheets require both: configured AND unlocked
  const atReady = atConfigured && isUnlocked;
  const gsReady = gsConfigured && isUnlocked;

  const getDesc = (id) => {
    if (id === "airtable") {
      if (!isUnlocked) return "🔒 Requires access key — click to unlock";
      if (!atConfigured) return "Not configured — set up in Integrations";
      return isBrain
        ? `Push Second Brain profile to ${atCfg.tableId || "table"}`
        : `Push to ${atCfg.tableId || "Projects"}`;
    }
    if (id === "gsheets") {
      if (!isUnlocked) return "🔒 Requires access key — click to unlock";
      if (!gsConfigured) return "Not configured — set up in Integrations";
      return isBrain ? "Append Second Brain row (27 columns)" : "Append scaffold row";
    }
    return "";
  };

  const targets = [
    {
      id: "clipboard",
      icon: "📋",
      name: "Copy All",
      desc: `Copy all ${fileCount} files to clipboard`,
      ready: true,
      locked: false,
    },
    {
      id: "download",
      icon: "📦",
      name: "Download ZIP",
      desc: isBrain
        ? `Save as ${downloadName}.zip with full folder structure`
        : `Save as ${downloadName}.zip`,
      ready: true,
      locked: false,
    },
    {
      id: "airtable",
      icon: "📊",
      name: "Airtable",
      desc: getDesc("airtable"),
      ready: atReady,
      locked: !isUnlocked,
      color: colors.airtable,
    },
    {
      id: "gsheets",
      icon: "📗",
      name: "Google Sheets",
      desc: getDesc("gsheets"),
      ready: gsReady,
      locked: !isUnlocked,
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
            const isLocked = t.locked;

            const handleClick = () => {
              if (isLoading) return;
              if (isLocked && onUnlock) {
                // Close export menu and open unlock modal
                onClose();
                onUnlock();
                return;
              }
              if (t.ready) doExport(t.id);
            };

            return (
              <button
                key={t.id}
                onClick={handleClick}
                disabled={isLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "14px 16px", marginBottom: 6,
                  background: isDone
                    ? "rgba(22,163,74,0.1)"
                    : isErr
                      ? "rgba(239,68,68,0.1)"
                      : isLocked
                        ? "rgba(255,255,255,0.02)"
                        : t.ready
                          ? colors.surfaceSubtle
                          : "rgba(255,255,255,0.01)",
                  border: `1px solid ${
                    isDone ? colors.successBg
                    : isErr ? colors.errorBg
                    : isLocked ? "rgba(255,255,255,0.06)"
                    : colors.border
                  }`,
                  borderRadius: radii["2xl"],
                  cursor: isLoading ? "default" : (isLocked || t.ready) ? "pointer" : "default",
                  opacity: (!t.ready && !isLocked) ? 0.4 : 1,
                  textAlign: "left",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0, opacity: isLocked ? 0.5 : 1 }}>
                  {isDone ? "✓" : isErr ? "✗" : isLoading ? "⏳" : isLocked ? "🔒" : t.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: fontSizes.xl,
                    fontWeight: fontWeights.semibold,
                    color: isDone ? colors.successLight
                      : isErr ? colors.error
                      : isLocked ? "rgba(255,255,255,0.35)"
                      : colors.text,
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontSize: fontSizes.md,
                    color: isDone ? colors.successLight
                      : isErr ? colors.error
                      : isLocked ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.3)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {isDone ? "Done!" : isErr ? "Failed — check Integrations settings" : isLoading ? "Exporting…" : t.desc}
                  </div>
                </div>
                {isLocked && (
                  <span style={{
                    fontSize: fontSizes.sm,
                    color: "rgba(255,103,42,0.7)",
                    flexShrink: 0,
                    padding: "3px 8px",
                    borderRadius: radii.md,
                    border: "1px solid rgba(255,103,42,0.2)",
                    background: "rgba(255,103,42,0.06)",
                  }}>
                    Unlock →
                  </span>
                )}
                {!isLocked && !t.ready && (
                  <span style={{ fontSize: fontSizes.sm, color: colors.textFaint, flexShrink: 0 }}>Setup →</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unlock prompt banner if not unlocked */}
        {!isUnlocked && (
          <div style={{ margin: "0 16px 16px", padding: "12px 14px", borderRadius: radii["2xl"], background: "rgba(255,103,42,0.06)", border: "1px solid rgba(255,103,42,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🔑</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: "rgba(255,103,42,0.9)" }}>
                  Airtable &amp; Sheets require an access key
                </div>
                <div style={{ fontSize: fontSizes.sm, color: colors.textFaint, marginTop: 2 }}>
                  Clipboard and ZIP download are always free.
                </div>
              </div>
              {onUnlock && (
                <button
                  onClick={() => { onClose(); onUnlock(); }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: radii.xl,
                    border: "none",
                    background: "linear-gradient(135deg, #ff672a, #ff9500)",
                    color: "white",
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.bold,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  🔓 Unlock
                </button>
              )}
            </div>
          </div>
        )}

        {isBrain && isUnlocked && (
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
