/**
 * UnlockModal
 * A dark-themed modal for entering an access key to unlock integrations.
 * Matches the existing Context Forge design system (dark bg, orange primary).
 */

import { useState, useEffect, useRef } from "react";
import { colors, fonts, fontSizes, fontWeights, radii, shadows } from "../tokens";

export function UnlockModal({ show, onClose, onValidate, isChecking, error }) {
  const [key, setKey] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setKey("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isChecking && key.trim()) onValidate(key);
  };

  const overlay = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
  };

  const modal = {
    background: colors.bgPanel,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: radii["4xl"],
    padding: "36px 32px",
    width: "100%",
    maxWidth: 420,
    boxShadow: shadows.xl || "0 24px 64px rgba(0,0,0,0.6)",
    fontFamily: fonts.primary,
    color: colors.text,
  };

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40, borderRadius: radii["2xl"],
            background: "rgba(255,103,42,0.12)",
            border: `1.5px solid rgba(255,103,42,0.25)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>🔑</div>
          <div>
            <div style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold }}>Unlock Integrations</div>
            <div style={{ fontSize: fontSizes.md, color: colors.textMuted, marginTop: 2 }}>
              Enter your access key to enable Airtable &amp; Sheets exports
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSubtle, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Access Key
            </label>
            <input
              ref={inputRef}
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="cf-xxxx-xxxx-xxxx"
              autoComplete="off"
              spellCheck={false}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: radii["2xl"],
                border: `1.5px solid ${error ? "rgba(239,68,68,0.4)" : colors.borderLight}`,
                background: colors.surfaceSubtle,
                color: colors.text,
                fontSize: fontSizes.base,
                fontFamily: fonts.mono,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,103,42,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = error ? "rgba(239,68,68,0.4)" : colors.borderLight; }}
            />
            {error && (
              <div style={{ marginTop: 6, fontSize: fontSizes.sm, color: "rgba(239,68,68,0.85)", display: "flex", alignItems: "center", gap: 4 }}>
                <span>⚠</span> {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "11px 0",
                borderRadius: radii["2xl"],
                border: `1px solid ${colors.borderLight}`,
                background: "transparent",
                color: colors.textMuted,
                fontSize: fontSizes.base,
                fontWeight: fontWeights.semibold,
                cursor: "pointer",
                fontFamily: fonts.primary,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChecking || !key.trim()}
              style={{
                flex: 2, padding: "11px 0",
                borderRadius: radii["2xl"],
                border: "none",
                background: isChecking || !key.trim()
                  ? colors.surfaceLight
                  : "linear-gradient(135deg, #ff672a, #ff9500)",
                color: isChecking || !key.trim() ? colors.textFaint : colors.text,
                fontSize: fontSizes.base,
                fontWeight: fontWeights.bold,
                cursor: isChecking || !key.trim() ? "default" : "pointer",
                fontFamily: fonts.primary,
                boxShadow: isChecking || !key.trim() ? "none" : "0 4px 16px rgba(255,103,42,0.35)",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {isChecking ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⏳</span>
                  Checking…
                </>
              ) : (
                <>🔓 Unlock</>
              )}
            </button>
          </div>
        </form>

        {/* Footer hint */}
        <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: radii["2xl"], background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: fontSizes.sm, color: colors.textFaint, lineHeight: 1.5 }}>
            Access keys unlock Airtable and Google Sheets export integrations. Keys are validated securely and never stored in plaintext.
          </div>
        </div>
      </div>
    </div>
  );
}
