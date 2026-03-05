import { useState, useRef, useEffect, useCallback } from "react";
import { QS } from "../data/questions";
import { Ring } from "../components/Ring";
import { Badges } from "../components/Badges";
import { CodeView } from "../components/CodeView";
import { colors, fonts, fontSizes, fontWeights, radii, shadows, animations } from "../tokens";

export function Desktop({ answers, setAnswers, cq, setCq, files, setFiles: _setFiles, sel, setSel, conf, live, canGen, gen, ptcl: _ptcl, showSettings, showExport, onBack }) {
  const [panel, setPanel] = useState("questions");
  const ref = useRef(null);
  const filled = answers.filter(a => a.trim()).length;
  const q = QS[cq];
  const upd = useCallback((v) => { setAnswers(p => { const n = [...p]; n[cq] = v; return n; }); }, [cq, setAnswers]);
  useEffect(() => { if (panel === "questions") setTimeout(() => ref.current?.focus(), 100); }, [cq, panel]);
  useEffect(() => {
    const h = (e) => {
      if (e.metaKey && e.key === "Enter") { e.preventDefault(); if (canGen) gen(); }
      if (e.key === "Tab" && !e.shiftKey && e.target.tagName === "TEXTAREA") { e.preventDefault(); if (cq < 9) setCq(c => c + 1); }
      if (e.key === "Tab" && e.shiftKey && e.target.tagName === "TEXTAREA") { e.preventDefault(); if (cq > 0) setCq(c => c - 1); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cq, canGen, gen, setCq]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: colors.bg, color: "white", fontFamily: fonts.primary }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {onBack && (
            <button onClick={onBack} style={{ padding: "4px 10px", borderRadius: radii.md, border: `1px solid ${colors.borderLight}`, background: "transparent", color: colors.textMuted, fontSize: fontSizes.base, cursor: "pointer", fontFamily: fonts.primary, flexShrink: 0 }}>← Back</button>
          )}
          <div style={{ width: 36, height: 36, borderRadius: radii["2xl"], background: colors.primaryGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: fontWeights.extrabold, boxShadow: shadows.glow }}>✦</div>
          <div>
            <h1 style={{ fontSize: fontSizes["4xl"], fontWeight: fontWeights.bold, margin: 0 }}>Context Forge</h1>
            <p style={{ fontSize: fontSizes.md, color: colors.textSubtle, margin: 0 }}>10 questions → project scaffold → export anywhere</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={showSettings} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: radii.xl, border: `1px solid ${colors.borderLight}`, background: "transparent", color: colors.textMuted, fontSize: fontSizes.base, fontWeight: fontWeights.semibold, cursor: "pointer" }}>⚡ Integrations</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Ring value={conf.overall} size={36} />
            <div>
              <div style={{ fontSize: fontSizes.sm, color: "rgba(255,255,255,0.3)", fontWeight: fontWeights.semibold, textTransform: "uppercase", letterSpacing: "0.5px" }}>Confidence</div>
              <div style={{ fontSize: fontSizes.base, color: conf.overall >= 0.8 ? colors.successLight : conf.overall >= 0.5 ? colors.warning : colors.textDimmed, fontWeight: fontWeights.semibold }}>{filled}/10</div>
            </div>
          </div>
          {files ? (
            <button onClick={showExport} style={{ padding: "10px 20px", borderRadius: radii["2xl"], border: "none", background: colors.success, color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, cursor: "pointer", boxShadow: colors.successGlow, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⬆</span>Export {Object.keys(files).length} Files
            </button>
          ) : (
            <button onClick={canGen ? gen : undefined} style={{ padding: "10px 20px", borderRadius: radii["2xl"], border: "none", background: canGen ? colors.primaryGradient : colors.surfaceLight, color: canGen ? colors.text : colors.textFaint, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, cursor: canGen ? "pointer" : "default", boxShadow: canGen ? colors.primaryGlow : "none", animation: canGen ? animations.pulse : "none", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: fontSizes.xl }}>◆</span>Generate {Object.keys(live).length} Files
              {canGen && <span style={{ fontSize: fontSizes.sm, opacity: 0.7 }}>⌘↵</span>}
            </button>
          )}
        </div>
      </div>

      {/* 3-panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar */}
        <div style={{ width: 270, borderRight: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 2, padding: "12px 12px 8px", borderBottom: `1px solid ${colors.surface}` }}>
            {["questions", "files"].map(t => (
              <button key={t} onClick={() => setPanel(t)} style={{ flex: 1, padding: "6px 0", borderRadius: radii.base, border: "none", background: panel === t ? colors.primarySubtle : "transparent", color: panel === t ? colors.primaryMuted : colors.textSubtle, fontSize: fontSizes.md, fontWeight: fontWeights.semibold, cursor: "pointer", textTransform: "capitalize", fontFamily: fonts.primary }}>{t}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
            {panel === "questions" ? QS.map((qu, i) => {
              const sc = conf.individual[qu.id] || 0, act = cq === i;
              return (
                <button key={qu.id} onClick={() => { setCq(i); setPanel("questions"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", width: "100%", background: act ? "rgba(255,103,42,0.08)" : "transparent", border: "none", borderRadius: radii["2xl"], cursor: "pointer", borderLeft: act ? `2px solid ${colors.primary}` : "2px solid transparent", marginBottom: 2 }}>
                  <div style={{ width: 26, height: 26, borderRadius: radii.lg, background: sc > 0 ? `${qu.color}22` : colors.surface, border: `1.5px solid ${sc > 0 ? qu.color + "44" : colors.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: sc > 0 ? qu.color : colors.textFaint, flexShrink: 0 }}>{qu.id}</div>
                  <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <div style={{ fontSize: fontSizes.base, fontWeight: act ? fontWeights.semibold : fontWeights.medium, color: act ? colors.text : answers[i]?.trim() ? colors.textSecondary : colors.textDimmed, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{qu.title}</div>
                    {answers[i]?.trim() && <div style={{ fontSize: fontSizes.sm, color: colors.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{answers[i].substring(0, 50)}</div>}
                  </div>
                  {sc > 0 && <span style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.bold, fontFamily: fonts.mono, color: sc >= 0.8 ? colors.successLight : sc >= 0.5 ? colors.warning : colors.error }}>{Math.round(sc * 100)}</span>}
                </button>
              );
            }) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ padding: "8px 12px", fontSize: fontSizes.sm, color: "rgba(255,255,255,0.3)", fontWeight: fontWeights.bold, textTransform: "uppercase", letterSpacing: "1px" }}>Files ({Object.keys(files || live).length})</div>
                {Object.keys(files || live).map(name => (
                  <button key={name} onClick={() => setSel(name)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: name === sel ? "rgba(255,103,42,0.12)" : "transparent", border: "none", borderRadius: radii.xl, cursor: "pointer", borderLeft: name === sel ? `2px solid ${colors.primary}` : "2px solid transparent" }}>
                    <span style={{ fontSize: fontSizes.base, fontWeight: name === sel ? fontWeights.semibold : fontWeights.normal, color: name === sel ? colors.text : "rgba(255,255,255,0.6)", fontFamily: fonts.mono, flex: 1, textAlign: "left" }}>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {panel === "questions" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: animations.fadeIn }}>
              <div style={{ padding: "24px 32px 16px", borderBottom: `1px solid ${colors.surface}`, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: radii["3xl"], background: `${q.color}18`, border: `2px solid ${q.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{q.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: q.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>Q{q.id} — {q.label}</span>
                      <Ring value={conf.individual[q.id] || 0} size={24} stroke={2.5} />
                    </div>
                    <h2 style={{ fontSize: fontSizes["6xl"], fontWeight: fontWeights.bold, margin: "4px 0 0" }}>{q.title}</h2>
                  </div>
                </div>
                <p style={{ fontSize: fontSizes.xl, color: "rgba(255,255,255,0.45)", margin: 0 }}>{q.sub}</p>
              </div>
              <div style={{ flex: 1, padding: "16px 32px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
                <textarea ref={ref} value={answers[cq]} onChange={e => upd(e.target.value)} placeholder={q.ph}
                  style={{ flex: 1, borderRadius: radii["4xl"], border: `1.5px solid ${colors.borderLight}`, background: colors.surfaceSubtle, padding: "16px 18px", fontSize: 15, lineHeight: 1.65, color: colors.text, resize: "none", outline: "none", minHeight: 120, fontFamily: fonts.primary }}
                  onFocus={e => { e.target.style.borderColor = "#ff672a44"; e.target.style.background = "rgba(255,103,42,0.03)"; }}
                  onBlur={e => { e.target.style.borderColor = colors.borderLight; e.target.style.background = colors.surfaceSubtle; }} />
                <Badges answers={answers} qi={cq} />
                <div style={{ flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: fontSizes.sm, color: colors.textGhost, fontWeight: fontWeights.semibold, lineHeight: "22px" }}>Generates →</span>
                    {q.out.map(f => (<span key={f} style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.primaryMuted, background: "rgba(255,103,42,0.1)", border: `1px solid ${colors.primarySubtle}`, padding: "2px 7px", borderRadius: radii.md, fontFamily: fonts.mono }}>{f}</span>))}
                  </div>
                  <p style={{ fontSize: fontSizes.md, color: colors.textGhost, margin: 0, maxWidth: 500 }}>{q.why}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "12px 32px 20px", borderTop: `1px solid ${colors.surface}`, flexShrink: 0, alignItems: "center" }}>
                <button onClick={() => cq > 0 && setCq(c => c - 1)} disabled={cq === 0} style={{ padding: "10px 18px", borderRadius: radii.xl, border: `1px solid ${colors.borderLight}`, background: "transparent", color: cq === 0 ? colors.textDisabled : "rgba(255,255,255,0.6)", fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, cursor: cq === 0 ? "default" : "pointer", fontFamily: fonts.primary }}>← Prev</button>
                <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
                  {QS.map((_, i) => (<button key={i} onClick={() => setCq(i)} style={{ width: cq === i ? 20 : 6, height: 6, borderRadius: radii.xs, background: cq === i ? colors.primary : answers[i]?.trim() ? "rgba(255,103,42,0.4)" : colors.borderLight, border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />))}
                </div>
                <button onClick={() => { if (cq < 9) setCq(c => c + 1); else if (canGen) gen(); }} style={{ padding: "10px 18px", borderRadius: radii.xl, border: "none", background: cq === 9 ? (canGen ? colors.primaryGradient : colors.surfaceLight) : colors.primary, color: cq === 9 && !canGen ? colors.textFaint : colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, cursor: cq === 9 && !canGen ? "default" : "pointer", fontFamily: fonts.primary }}>{cq === 9 ? "◆ Generate" : "Next →"}</button>
                <span style={{ fontSize: fontSizes.sm, color: colors.textFaint, marginLeft: 4 }}>Tab / ⇧Tab</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: colors.bgCode, animation: animations.fadeIn }}>
              <CodeView content={(files || live)[sel] || ""} filename={sel} />
            </div>
          )}
        </div>

        {/* Right preview */}
        <div style={{ width: 300, borderLeft: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${colors.surface}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textMuted }}>LIVE PREVIEW</span>
            <span style={{ fontSize: fontSizes.xs, padding: "2px 8px", borderRadius: radii.sm, background: "rgba(22,163,74,0.15)", color: colors.successLight, fontWeight: fontWeights.bold }}>LIVE</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: colors.bgCode }}>
            <pre style={{ padding: "12px 16px", margin: 0, fontSize: 10.5, lineHeight: 1.6, color: colors.textMuted, fontFamily: fonts.mono, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{live[sel] || "..."}</pre>
          </div>
          <div style={{ padding: "8px", borderTop: `1px solid ${colors.surface}`, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.keys(live).map(f => (
              <button key={f} onClick={() => setSel(f)} style={{ padding: "3px 8px", borderRadius: radii.md, border: "none", background: f === sel ? "rgba(255,103,42,0.2)" : colors.surface, color: f === sel ? colors.primaryMuted : "rgba(255,255,255,0.3)", fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, cursor: "pointer", fontFamily: fonts.mono }}>{f}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
