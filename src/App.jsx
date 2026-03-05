import { useState, useEffect, useMemo, useCallback } from "react";
import { globalStyles, colors, fonts, fontSizes, fontWeights, radii } from "./tokens";
import { LS } from "./data/localStorage";
import { genFiles, calcConf } from "./engines";
import { useIsMobile } from "./hooks/useIsMobile";
import { Particles, SettingsPanel, ExportMenu } from "./components";
import { Mobile } from "./layouts/Mobile";
import { Desktop } from "./layouts/Desktop";
import { SecondBrainApp } from "./second-brain/index.js";

// Mode selector shown before the user picks which tool to use
function ModeSelector({ onSelect }) {
  const [hover, setHover] = useState(null);

  const cardBase = {
    flex: 1,
    maxWidth: 340,
    padding: "32px 28px",
    borderRadius: radii["4xl"],
    border: `1px solid ${colors.borderLight}`,
    background: colors.bgPanel,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontFamily: fonts.primary,
    textAlign: "left",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: colors.bg, fontFamily: fonts.primary, padding: 24 }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: fontWeights.extrabold, color: colors.text, letterSpacing: "-0.02em" }}>
          <span style={{ color: colors.primary }}>◆</span> Context Forge
        </div>
        <p style={{ margin: "8px 0 0", fontSize: fontSizes["3xl"], color: colors.textMuted }}>
          What are you building today?
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {/* Project Scaffold */}
        <div
          onClick={() => onSelect("forge")}
          onMouseEnter={() => setHover("forge")}
          onMouseLeave={() => setHover(null)}
          style={{
            ...cardBase,
            border: hover === "forge" ? `1px solid ${colors.primaryBorder}` : `1px solid ${colors.borderLight}`,
            background: hover === "forge" ? "rgba(255,103,42,0.04)" : colors.bgPanel,
            boxShadow: hover === "forge" ? colors.primaryGlow : "none",
          }}
        >
          <div style={{ fontSize: 28 }}>⚙</div>
          <div>
            <div style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold, color: colors.text, marginBottom: 4 }}>
              Project Scaffold
            </div>
            <div style={{ fontSize: fontSizes.xl, color: colors.textMuted, lineHeight: 1.5 }}>
              10 questions → production-ready context files for any AI coding agent. Generates soul.md, claude.md, package.json, types.ts, and more.
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {["soul.md", "claude.md", "package.json", "types.ts", ".cursorrules"].map(f => (
              <span key={f} style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.primaryMuted, background: "rgba(255,103,42,0.1)", border: `1px solid ${colors.primarySubtle}`, padding: "2px 7px", borderRadius: radii.md, fontFamily: fonts.mono }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Second Brain */}
        <div
          onClick={() => onSelect("brain")}
          onMouseEnter={() => setHover("brain")}
          onMouseLeave={() => setHover(null)}
          style={{
            ...cardBase,
            border: hover === "brain" ? `1px solid rgba(100,180,255,0.3)` : `1px solid ${colors.borderLight}`,
            background: hover === "brain" ? "rgba(100,180,255,0.03)" : colors.bgPanel,
            boxShadow: hover === "brain" ? "0 4px 20px rgba(100,180,255,0.15)" : "none",
          }}
        >
          <div style={{ fontSize: 28 }}>◈</div>
          <div>
            <div style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold, color: colors.text, marginBottom: 4 }}>
              Second Brain
            </div>
            <div style={{ fontSize: fontSizes.xl, color: colors.textMuted, lineHeight: 1.5 }}>
              6 onboarding sections → personal executive assistant setup for Claude Code. Generates CLAUDE.md, context files, rules, and project folders.
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {["CLAUDE.md", "context/", ".claude/rules/", "projects/", "decisions/"].map(f => (
              <span key={f} style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: "rgba(100,180,255,0.8)", background: "rgba(100,180,255,0.08)", border: `1px solid rgba(100,180,255,0.15)`, padding: "2px 7px", borderRadius: radii.md, fontFamily: fonts.mono }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState(() => LS.get("mode", null));

  // Project Scaffold state
  const [cq, setCq] = useState(0);
  const [answers, setAnswers] = useState(() => LS.get("answers", Array(10).fill("")));
  const [files, setFiles] = useState(null);
  const [sel, setSel] = useState("soul.md");
  const [ptcl, setPtcl] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [integrations, setIntegrations] = useState(() => LS.get("integrations", {}));

  useEffect(() => { LS.set("answers", answers); }, [answers]);
  useEffect(() => { LS.set("integrations", integrations); }, [integrations]);
  useEffect(() => { LS.set("mode", mode); }, [mode]);

  const conf = useMemo(() => calcConf(answers), [answers]);
  const canGen = answers.filter(a => a.trim()).length >= 3;
  const live = useMemo(() => genFiles(answers), [answers]);

  const gen = useCallback(() => {
    const f = genFiles(answers);
    setFiles(f);
    setSel("soul.md");
    setPtcl(true);
    setTimeout(() => setPtcl(false), 1200);
  }, [answers]);

  const forgeProps = {
    answers, setAnswers, cq, setCq, files, setFiles, sel, setSel,
    conf, live, canGen, gen, ptcl,
    showSettings: () => setSettingsOpen(true),
    showExport: () => setExportOpen(true),
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <>
        <style>{globalStyles}</style>
        <ModeSelector onSelect={setMode} />
      </>
    );
  }

  if (mode === "brain") {
    return (
      <>
        <style>{globalStyles}</style>
        <SecondBrainApp onBack={() => setMode(null)} />
      </>
    );
  }

  // Default: Project Scaffold (mode === "forge")
  return (
    <>
      <style>{globalStyles}</style>
      <Particles on={ptcl} />
      <SettingsPanel show={settingsOpen} onClose={() => setSettingsOpen(false)} integrations={integrations} setIntegrations={setIntegrations} />
      <ExportMenu show={exportOpen} onClose={() => setExportOpen(false)} files={files || live} answers={answers} integrations={integrations} />
      {isMobile ? <Mobile {...forgeProps} /> : <Desktop {...forgeProps} />}
    </>
  );
}
