import { useState, useRef, useEffect, useCallback } from "react";
import { QS } from "../data/questions";
import { copyAll } from "../exporters/clipboard";
import { Ring } from "../components/Ring";
import { Badges } from "../components/Badges";
import { CodeView } from "../components/CodeView";
import { colors, fonts, fontSizes, fontWeights, radii, animations } from "../tokens";

export function Mobile({ answers, setAnswers, cq, setCq, files, setFiles, sel, setSel, conf, live, canGen, gen, ptcl, showSettings, showExport }) {
  const [tab, setTab] = useState("edit");
  const ref = useRef(null);
  const filled = answers.filter(a => a.trim()).length;
  const q = QS[cq];
  useEffect(() => { if (tab === "edit") setTimeout(() => ref.current?.focus(), 150); }, [cq, tab]);
  const upd = useCallback((v) => { setAnswers(p => { const n = [...p]; n[cq] = v; return n; }); }, [cq, setAnswers]);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: colors.bg, color: "white", fontFamily: fonts.primary, overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: radii.xl, background: colors.primaryGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSizes.xl, fontWeight: fontWeights.extrabold }}>✦</div>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: fontWeights.bold, margin: 0 }}>Context Forge</h1>
            <p style={{ fontSize: fontSizes.sm, color: "rgba(255,255,255,0.3)", margin: 0 }}>{filled}/10</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={showSettings} style={{ width: 30, height: 30, borderRadius: radii.xl, border: `1px solid ${colors.borderLight}`, background: "transparent", color: colors.textDimmed, fontSize: fontSizes.xl, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</button>
          <Ring value={conf.overall} size={30} stroke={2.5} />
          <button onClick={files ? showExport : (canGen ? gen : undefined)} style={{ padding: "8px 14px", borderRadius: radii.xl, border: "none", background: files ? colors.success : canGen ? colors.primaryGradient : colors.surfaceLight, color: files ? colors.text : canGen ? colors.text : colors.textFaint, fontSize: fontSizes.base, fontWeight: fontWeights.bold, cursor: canGen || files ? "pointer" : "default" }}>
            {files ? "⬆ Export" : "◆ Generate"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {tab === "edit" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: animations.fadeInFast }}>
            <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", flexShrink: 0, WebkitOverflowScrolling: "touch" }}>
              {QS.map((qu, i) => {
                const sc = conf.individual[qu.id] || 0, act = cq === i;
                return (
                  <button key={qu.id} onClick={() => setCq(i)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: radii.xl, background: act ? colors.primarySubtle : sc > 0 ? colors.surface : "transparent", border: act ? `1.5px solid ${colors.primaryBorder}` : `1px solid ${colors.border}`, flexShrink: 0, cursor: "pointer" }}>
                    <span style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: act ? colors.primary : sc > 0 ? qu.color : colors.textGhost }}>{qu.id}</span>
                    <span style={{ fontSize: fontSizes.md, fontWeight: act ? fontWeights.semibold : fontWeights.normal, color: act ? colors.text : colors.textDimmed, whiteSpace: "nowrap" }}>{qu.label}</span>
                    {sc > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc >= 0.8 ? colors.success : colors.warning }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "8px 16px 0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: fontSizes["4xl"] }}>{q.icon}</span>
                <h2 style={{ fontSize: fontSizes["5xl"], fontWeight: fontWeights.bold, margin: 0, flex: 1 }}>{q.title}</h2>
                <Ring value={conf.individual[q.id] || 0} size={26} stroke={2.5} />
              </div>
              <p style={{ fontSize: fontSizes.lg, color: colors.textDimmed, lineHeight: 1.4, margin: "0 0 8px" }}>{q.sub}</p>
            </div>
            <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 8, overflow: "hidden", minHeight: 0 }}>
              <textarea ref={ref} value={answers[cq]} onChange={e => upd(e.target.value)} placeholder={q.ph}
                style={{ flex: 1, borderRadius: radii["3xl"], border: `1.5px solid ${colors.borderLight}`, background: colors.surfaceSubtle, padding: "12px 14px", fontSize: 15, lineHeight: 1.6, color: colors.text, resize: "none", outline: "none", minHeight: 80, fontFamily: fonts.primary }}
                onFocus={e => { e.target.style.borderColor = "#ff672a44"; e.target.style.background = "rgba(255,103,42,0.03)"; }}
                onBlur={e => { e.target.style.borderColor = colors.borderLight; e.target.style.background = colors.surfaceSubtle; }} />
              <Badges answers={answers} qi={cq} compact />
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0 }}>
                <span style={{ fontSize: fontSizes.xs, color: colors.textFaint }}>→</span>
                {q.out.map(f => (<span key={f} style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, color: colors.primaryMuted, background: "rgba(255,103,42,0.1)", padding: "1px 6px", borderRadius: radii.sm, fontFamily: fonts.mono }}>{f}</span>))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "10px 16px", flexShrink: 0 }}>
              <button onClick={() => cq > 0 && setCq(c => c - 1)} disabled={cq === 0} style={{ flex: 1, padding: "12px", borderRadius: radii["2xl"], border: `1px solid ${colors.borderLight}`, background: "transparent", color: cq === 0 ? colors.textDisabled : "rgba(255,255,255,0.6)", fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, cursor: cq === 0 ? "default" : "pointer", fontFamily: fonts.primary }}>←</button>
              <button onClick={() => { if (cq < 9) setCq(c => c + 1); else if (canGen) gen(); }} style={{ flex: 3, padding: "12px", borderRadius: radii["2xl"], border: "none", background: cq === 9 ? (canGen ? colors.primaryGradient : colors.surfaceLight) : colors.primary, color: cq === 9 && !canGen ? colors.textFaint : colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, cursor: cq === 9 && !canGen ? "default" : "pointer", fontFamily: fonts.primary }}>{cq === 9 ? "◆ Generate" : "Next →"}</button>
            </div>
          </div>
        )}
        {tab === "files" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: animations.fadeInFast }}>
            <div style={{ display: "flex", gap: 4, padding: "10px 12px", overflowX: "auto", flexShrink: 0, WebkitOverflowScrolling: "touch" }}>
              {Object.keys(files || live).map(f => (
                <button key={f} onClick={() => setSel(f)} style={{ padding: "5px 10px", borderRadius: radii.base, border: "none", whiteSpace: "nowrap", background: f === sel ? "rgba(255,103,42,0.2)" : colors.surface, color: f === sel ? colors.primaryMuted : colors.textSubtle, fontSize: fontSizes.md, fontWeight: fontWeights.semibold, cursor: "pointer", fontFamily: fonts.mono }}>{f}</button>
              ))}
            </div>
            <div style={{ flex: 1, background: colors.bgCode, overflow: "hidden" }}>
              <CodeView content={(files || live)[sel] || ""} filename={sel} compact />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderTop: `1px solid ${colors.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: fontSizes.sm, color: colors.textFaint }}>{Object.keys(files || live).length} files</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => copyAll(files || live)} style={{ padding: "5px 12px", borderRadius: radii.base, border: `1px solid ${colors.borderMedium}`, background: "transparent", color: colors.textMuted, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, cursor: "pointer" }}>Copy All</button>
                {files && <button onClick={showExport} style={{ padding: "5px 12px", borderRadius: radii.base, border: "none", background: colors.primary, color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold, cursor: "pointer" }}>Export ⬆</button>}
              </div>
            </div>
          </div>
        )}
        {tab === "graph" && (
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", animation: animations.fadeInFast }}>
            <h3 style={{ fontSize: fontSizes["3xl"], fontWeight: fontWeights.bold, margin: "0 0 12px" }}>Coverage</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
              {QS.map((qu, i) => (
                <button key={qu.id} onClick={() => { setCq(i); setTab("edit"); }} style={{ padding: "10px 4px", borderRadius: radii["2xl"], border: `1px solid ${colors.border}`, background: colors.surfaceHover, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Ring value={conf.individual[qu.id] || 0} size={28} stroke={2.5} />
                  <span style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, color: colors.textDimmed }}>Q{qu.id}</span>
                </button>
              ))}
            </div>
            {conf.issues.length > 0 && <>
              <div style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Issues ({conf.issues.length})</div>
              {conf.issues.map((is, i) => (
                <button key={i} onClick={() => { setCq(is.q - 1); setTab("edit"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", marginBottom: 6, width: "100%", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: radii["2xl"], cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.error, width: 24, height: 24, borderRadius: radii.base, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{is.q}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: "rgba(255,255,255,0.6)" }}>{is.l}</div>
                    <div style={{ fontSize: fontSizes.sm, color: "rgba(255,255,255,0.3)" }}>{is.m}</div>
                  </div>
                  <span style={{ fontSize: fontSizes.md, color: colors.textFaint }}>Fix →</span>
                </button>
              ))}
            </>}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", borderTop: `1px solid ${colors.border}`, flexShrink: 0, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)", paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        {[{ id: "edit", label: "Questions", icon: "✦" }, { id: "files", label: "Files", icon: "◈" }, { id: "graph", label: "Status", icon: "◐" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 6px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: fonts.primary }}>
            <span style={{ fontSize: fontSizes["4xl"], opacity: tab === t.id ? 1 : 0.35, transition: "opacity 0.15s" }}>{t.icon}</span>
            <span style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: tab === t.id ? colors.primary : "rgba(255,255,255,0.3)", transition: "color 0.15s" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
