import { useState, useEffect, useMemo, useCallback } from "react";
import { colors, fonts, fontSizes, fontWeights, radii, animations } from "../tokens/index.js";
import { SB_SECTIONS } from "./sbQuestions.js";
import { genSecondBrainFiles } from "./genSecondBrainFiles.js";
import { CodeView } from "../components/CodeView.jsx";
import { ExportMenu } from "../components/ExportMenu.jsx";
import { SettingsPanel } from "../components/SettingsPanel.jsx";
import { LS } from "../data/localStorage.js";

const SB_LS_KEY = "sb_answers";

function loadAnswers() {
  try {
    const raw = localStorage.getItem(SB_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswers(answers) {
  try {
    localStorage.setItem(SB_LS_KEY, JSON.stringify(answers));
  } catch {}
}

function countAnswered(answers) {
  return SB_SECTIONS.flatMap(s => s.questions).filter(q => (answers[q.id] || "").trim()).length;
}

const TOTAL_Q = SB_SECTIONS.flatMap(s => s.questions).length;

export default function SecondBrainApp({ onBack }) {
  const [answers, setAnswers] = useState(() => loadAnswers());
  const [sectionIdx, setSectionIdx] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [sel, setSel] = useState("CLAUDE.md");
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [integrations, setIntegrations] = useState(() => LS.get("integrations", {}));

  useEffect(() => { saveAnswers(answers); }, [answers]);
  useEffect(() => { LS.set("integrations", integrations); }, [integrations]);

  const live = useMemo(() => genSecondBrainFiles(answers), [answers]);
  const fileList = useMemo(() => Object.keys(live), [live]);
  const answered = useMemo(() => countAnswered(answers), [answers]);
  const canGen = answered >= 3;

  const section = SB_SECTIONS[sectionIdx];

  const setAnswer = useCallback((id, val) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }, []);

  const handleGenerate = useCallback(() => {
    setGenerated(true);
    setSel("CLAUDE.md");
  }, []);

  const isLastSection = sectionIdx === SB_SECTIONS.length - 1;

  // ── Styles ────────────────────────────────────────────────────────────────
  const headerStyle = {
    height: 52,
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 10,
    flexShrink: 0,
    background: colors.bgPanel,
  };

  const panelStyle = {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  };

  const leftStyle = {
    width: 220,
    borderRight: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flexShrink: 0,
    background: colors.bgPanel,
  };

  const centerStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const rightStyle = {
    width: 300,
    borderLeft: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flexShrink: 0,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: colors.bg, color: colors.text, fontFamily: fonts.primary }}>
      {/* Export & Settings modals */}
      <ExportMenu
        show={exportOpen}
        onClose={() => setExportOpen(false)}
        files={live}
        answers={answers}
        integrations={integrations}
        mode="brain"
      />
      <SettingsPanel
        show={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        integrations={integrations}
        setIntegrations={setIntegrations}
      />

      {/* Header */}
      <div style={headerStyle}>
        <button
          onClick={onBack}
          style={{ padding: "4px 10px", borderRadius: radii.md, border: `1px solid ${colors.borderLight}`, background: "transparent", color: colors.textMuted, fontSize: fontSizes.base, cursor: "pointer", fontFamily: fonts.primary }}
        >
          ← Back
        </button>
        <span style={{ fontSize: fontSizes["3xl"], fontWeight: fontWeights.bold, color: colors.text }}>
          <span style={{ color: colors.primary }}>◆</span> Second Brain
        </span>
        <span style={{ fontSize: fontSizes.sm, color: colors.textGhost }}>
          Personal Executive Assistant Setup
        </span>
        <div style={{ flex: 1 }} />

        {/* Progress bar */}
        <span style={{ fontSize: fontSizes.sm, color: colors.textGhost }}>
          {answered}/{TOTAL_Q}
        </span>
        <div style={{ width: 60, height: 4, background: colors.surface, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(answered / TOTAL_Q) * 100}%`, height: "100%", background: colors.primaryGradient, transition: "width 0.3s" }} />
        </div>

        {/* Integrations button */}
        <button
          onClick={() => setSettingsOpen(true)}
          style={{ padding: "6px 12px", borderRadius: radii.xl, border: `1px solid ${colors.borderLight}`, background: "transparent", color: colors.textMuted, fontSize: fontSizes.base, fontWeight: fontWeights.semibold, cursor: "pointer", fontFamily: fonts.primary }}
        >
          ⚡ Integrations
        </button>

        {/* Export button — shown after generate, or always if canGen */}
        {generated ? (
          <button
            onClick={() => setExportOpen(true)}
            style={{ padding: "6px 16px", borderRadius: radii.xl, border: "none", background: colors.success, color: colors.text, fontSize: fontSizes.base, fontWeight: fontWeights.bold, cursor: "pointer", fontFamily: fonts.primary, boxShadow: colors.successGlow, display: "flex", alignItems: "center", gap: 6 }}
          >
            ⬆ Export Files
          </button>
        ) : canGen ? (
          <button
            onClick={handleGenerate}
            style={{ padding: "6px 16px", borderRadius: radii.xl, border: "none", background: colors.primaryGradient, color: colors.text, fontSize: fontSizes.base, fontWeight: fontWeights.bold, cursor: "pointer", fontFamily: fonts.primary, boxShadow: colors.primaryGlow }}
          >
            ◆ Generate Files
          </button>
        ) : null}
      </div>

      {/* Body */}
      <div style={panelStyle}>
        {/* Left: Section nav */}
        <div style={leftStyle}>
          <div style={{ padding: "12px 16px 8px", fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textGhost, letterSpacing: "0.08em" }}>
            SECTIONS
          </div>
          {SB_SECTIONS.map((sec, i) => {
            const secAnswered = sec.questions.filter(q => (answers[q.id] || "").trim()).length;
            const isActive = i === sectionIdx;
            return (
              <button
                key={sec.id}
                onClick={() => setSectionIdx(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 16px",
                  background: isActive ? "rgba(255,103,42,0.08)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? `2px solid ${colors.primary}` : "2px solid transparent",
                  color: isActive ? colors.text : colors.textMuted,
                  fontSize: fontSizes.base,
                  fontWeight: isActive ? fontWeights.semibold : fontWeights.normal,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: fonts.primary,
                  width: "100%",
                }}
              >
                <span style={{ color: sec.color, fontSize: fontSizes.lg }}>{sec.icon}</span>
                <span style={{ flex: 1 }}>{sec.label}</span>
                {secAnswered === sec.questions.length ? (
                  <span style={{ fontSize: fontSizes.xs, color: colors.successLight, fontWeight: fontWeights.bold }}>✓</span>
                ) : secAnswered > 0 ? (
                  <span style={{ fontSize: fontSizes.xs, color: colors.primaryMuted }}>{secAnswered}/{sec.questions.length}</span>
                ) : null}
              </button>
            );
          })}

          {/* File tree */}
          <div style={{ marginTop: "auto", borderTop: `1px solid ${colors.border}`, padding: "10px 16px 8px", fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textGhost, letterSpacing: "0.08em" }}>
            OUTPUT FILES
          </div>
          <div style={{ overflow: "auto", flex: "0 0 auto", maxHeight: 200 }}>
            {fileList.map(f => (
              <button
                key={f}
                onClick={() => setSel(f)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "3px 16px",
                  background: f === sel ? "rgba(255,103,42,0.08)" : "transparent",
                  border: "none",
                  color: f === sel ? colors.primaryMuted : colors.textGhost,
                  fontSize: fontSizes.xs,
                  fontFamily: fonts.mono,
                  textAlign: "left",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Questions or Generated view */}
        <div style={centerStyle}>
          {!generated ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: animations.fadeIn }}>
              {/* Section header */}
              <div style={{ padding: "20px 32px 12px", borderBottom: `1px solid ${colors.surface}`, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 22, color: section.color }}>{section.icon}</span>
                  <span style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold }}>{section.title}</span>
                  <span style={{ fontSize: fontSizes.sm, color: colors.textGhost, marginLeft: 4 }}>
                    {section.id}/{SB_SECTIONS.length}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: fontSizes.xl, color: colors.textMuted }}>{section.sub}</p>
              </div>

              {/* Questions */}
              <div style={{ flex: 1, overflow: "auto", padding: "20px 32px" }}>
                {section.questions.map((q) => (
                  <div key={q.id} style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, color: colors.textSecondary, marginBottom: 6 }}>
                      {q.label}
                      <span style={{ marginLeft: 8, fontSize: fontSizes.sm, color: colors.textGhost }}>
                        → {q.out.join(", ")}
                      </span>
                    </label>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder={q.ph}
                      rows={["products", "focuses", "projects", "recurring", "keypeople"].includes(q.id) ? 4 : 2}
                      style={{
                        width: "100%",
                        borderRadius: radii.md,
                        border: `1px solid ${colors.borderLight}`,
                        background: colors.surfaceSubtle,
                        padding: "10px 14px",
                        fontSize: fontSizes.xl,
                        lineHeight: 1.6,
                        color: colors.text,
                        resize: "vertical",
                        outline: "none",
                        fontFamily: fonts.primary,
                        boxSizing: "border-box",
                      }}
                      onFocus={e => { e.target.style.borderColor = "rgba(255,103,42,0.4)"; e.target.style.background = "rgba(255,103,42,0.03)"; }}
                      onBlur={e => { e.target.style.borderColor = colors.borderLight; e.target.style.background = colors.surfaceSubtle; }}
                    />
                  </div>
                ))}
              </div>

              {/* Nav */}
              <div style={{ display: "flex", gap: 8, padding: "12px 32px 20px", borderTop: `1px solid ${colors.surface}`, flexShrink: 0, alignItems: "center" }}>
                <button
                  onClick={() => sectionIdx > 0 && setSectionIdx(i => i - 1)}
                  disabled={sectionIdx === 0}
                  style={{ padding: "10px 18px", borderRadius: radii.xl, border: `1px solid ${colors.borderLight}`, background: "transparent", color: sectionIdx === 0 ? colors.textDisabled : "rgba(255,255,255,0.6)", fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, cursor: sectionIdx === 0 ? "default" : "pointer", fontFamily: fonts.primary }}
                >
                  ← Prev
                </button>
                <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
                  {SB_SECTIONS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSectionIdx(i)}
                      style={{ width: i === sectionIdx ? 20 : 6, height: 6, borderRadius: radii.xs, background: i === sectionIdx ? colors.primary : SB_SECTIONS[i].questions.some(q => (answers[q.id] || "").trim()) ? "rgba(255,103,42,0.4)" : colors.borderLight, border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }}
                    />
                  ))}
                </div>
                {isLastSection ? (
                  <button
                    onClick={canGen ? handleGenerate : undefined}
                    disabled={!canGen}
                    style={{ padding: "10px 18px", borderRadius: radii.xl, border: "none", background: canGen ? colors.primaryGradient : colors.surfaceLight, color: canGen ? colors.text : colors.textFaint, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, cursor: canGen ? "pointer" : "default", fontFamily: fonts.primary }}
                  >
                    ◆ Generate
                  </button>
                ) : (
                  <button
                    onClick={() => setSectionIdx(i => i + 1)}
                    style={{ padding: "10px 18px", borderRadius: radii.xl, border: "none", background: colors.primary, color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, cursor: "pointer", fontFamily: fonts.primary }}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Generated file view
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: colors.bgCode, animation: animations.fadeIn }}>
              <div style={{ padding: "10px 20px", borderBottom: `1px solid ${colors.surface}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: fontSizes.sm, color: colors.successLight, fontWeight: fontWeights.bold, background: colors.successBg, padding: "2px 8px", borderRadius: radii.sm }}>✓ GENERATED</span>
                <span style={{ fontSize: fontSizes.base, color: colors.textMuted, fontFamily: fonts.mono }}>{sel}</span>
                <div style={{ flex: 1 }} />
                <button
                  onClick={() => setExportOpen(true)}
                  style={{ padding: "5px 14px", borderRadius: radii.xl, border: "none", background: colors.success, color: colors.text, fontSize: fontSizes.base, fontWeight: fontWeights.bold, cursor: "pointer", fontFamily: fonts.primary, display: "flex", alignItems: "center", gap: 6 }}
                >
                  ⬆ Export
                </button>
                <button
                  onClick={() => setGenerated(false)}
                  style={{ padding: "4px 10px", borderRadius: radii.md, border: `1px solid ${colors.borderLight}`, background: "transparent", color: colors.textMuted, fontSize: fontSizes.base, cursor: "pointer", fontFamily: fonts.primary }}
                >
                  ← Edit Answers
                </button>
              </div>
              <CodeView content={live[sel] || ""} filename={sel} />
            </div>
          )}
        </div>

        {/* Right: Live preview */}
        <div style={rightStyle}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${colors.surface}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textMuted }}>LIVE PREVIEW</span>
            <span style={{ fontSize: fontSizes.xs, padding: "2px 8px", borderRadius: radii.sm, background: "rgba(22,163,74,0.15)", color: colors.successLight, fontWeight: fontWeights.bold }}>LIVE</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: colors.bgCode }}>
            <pre style={{ padding: "12px 16px", margin: 0, fontSize: 10.5, lineHeight: 1.6, color: colors.textMuted, fontFamily: fonts.mono, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {live[sel] || "..."}
            </pre>
          </div>
          <div style={{ padding: "8px", borderTop: `1px solid ${colors.surface}`, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {fileList.map(f => (
              <button
                key={f}
                onClick={() => setSel(f)}
                style={{ padding: "3px 8px", borderRadius: radii.md, border: "none", background: f === sel ? "rgba(255,103,42,0.2)" : colors.surface, color: f === sel ? colors.primaryMuted : "rgba(255,255,255,0.3)", fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, cursor: "pointer", fontFamily: fonts.mono }}
              >
                {f.split("/").pop()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
