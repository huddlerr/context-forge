import { useState, useRef, useEffect, useCallback } from "react";
import { QS } from "../data/questions";
import { Ring } from "../components/Ring";
import { Badges } from "../components/Badges";
import { CodeView } from "../components/CodeView";

export function Desktop({ answers, setAnswers, cq, setCq, files, setFiles, sel, setSel, conf, live, canGen, gen, ptcl, showSettings, showExport }) {
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0f", color: "white", fontFamily: "'Satoshi',sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#ff672a,#ff9500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, boxShadow: "0 4px 16px rgba(255,103,42,0.3)" }}>✦</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Context Forge</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>10 questions → project scaffold → export anywhere</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={showSettings} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⚡ Integrations</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Ring value={conf.overall} size={36} />
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Confidence</div>
              <div style={{ fontSize: 12, color: conf.overall >= 0.8 ? "#4ade80" : conf.overall >= 0.5 ? "#f59e0b" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>{filled}/10</div>
            </div>
          </div>
          {files ? (
            <button onClick={showExport} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(22,163,74,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>⬆</span>Export {Object.keys(files).length} Files
            </button>
          ) : (
            <button onClick={canGen ? gen : undefined} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: canGen ? "linear-gradient(135deg,#ff672a,#ff9500)" : "rgba(255,255,255,0.06)", color: canGen ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 700, cursor: canGen ? "pointer" : "default", boxShadow: canGen ? "0 4px 20px rgba(255,103,42,0.3)" : "none", animation: canGen ? "cfPulse 2s infinite" : "none", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>◆</span>Generate {Object.keys(live).length} Files
              {canGen && <span style={{ fontSize: 10, opacity: 0.7 }}>⌘↵</span>}
            </button>
          )}
        </div>
      </div>

      {/* 3-panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar */}
        <div style={{ width: 270, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 2, padding: "12px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {["questions", "files"].map(t => (
              <button key={t} onClick={() => setPanel(t)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: panel === t ? "rgba(255,103,42,0.15)" : "transparent", color: panel === t ? "#ff9966" : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: "'Satoshi',sans-serif" }}>{t}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
            {panel === "questions" ? QS.map((qu, i) => {
              const sc = conf.individual[qu.id] || 0, act = cq === i;
              return (
                <button key={qu.id} onClick={() => { setCq(i); setPanel("questions"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", width: "100%", background: act ? "rgba(255,103,42,0.08)" : "transparent", border: "none", borderRadius: 10, cursor: "pointer", borderLeft: act ? "2px solid #ff672a" : "2px solid transparent", marginBottom: 2 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: sc > 0 ? `${qu.color}22` : "rgba(255,255,255,0.04)", border: `1.5px solid ${sc > 0 ? qu.color + "44" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: sc > 0 ? qu.color : "rgba(255,255,255,0.2)", flexShrink: 0 }}>{qu.id}</div>
                  <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: act ? 600 : 500, color: act ? "#fff" : answers[i]?.trim() ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{qu.title}</div>
                    {answers[i]?.trim() && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{answers[i].substring(0, 50)}</div>}
                  </div>
                  {sc > 0 && <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: sc >= 0.8 ? "#4ade80" : sc >= 0.5 ? "#f59e0b" : "#ef4444" }}>{Math.round(sc * 100)}</span>}
                </button>
              );
            }) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ padding: "8px 12px", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Files ({Object.keys(files || live).length})</div>
                {Object.keys(files || live).map(name => (
                  <button key={name} onClick={() => setSel(name)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: name === sel ? "rgba(255,103,42,0.12)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer", borderLeft: name === sel ? "2px solid #ff672a" : "2px solid transparent" }}>
                    <span style={{ fontSize: 12, fontWeight: name === sel ? 600 : 400, color: name === sel ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: "'JetBrains Mono',monospace", flex: 1, textAlign: "left" }}>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {panel === "questions" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "cfFadeIn 0.3s" }}>
              <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${q.color}18`, border: `2px solid ${q.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{q.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: q.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>Q{q.id} — {q.label}</span>
                      <Ring value={conf.individual[q.id] || 0} size={24} stroke={2.5} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>{q.title}</h2>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>{q.sub}</p>
              </div>
              <div style={{ flex: 1, padding: "16px 32px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
                <textarea ref={ref} value={answers[cq]} onChange={e => upd(e.target.value)} placeholder={q.ph}
                  style={{ flex: 1, borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "16px 18px", fontSize: 15, lineHeight: 1.65, color: "#fff", resize: "none", outline: "none", minHeight: 120, fontFamily: "'Satoshi',sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = "#ff672a44"; e.target.style.background = "rgba(255,103,42,0.03)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)"; }} />
                <Badges answers={answers} qi={cq} />
                <div style={{ flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600, lineHeight: "22px" }}>Generates →</span>
                    {q.out.map(f => (<span key={f} style={{ fontSize: 10, fontWeight: 600, color: "#ff9966", background: "rgba(255,103,42,0.1)", border: "1px solid rgba(255,103,42,0.15)", padding: "2px 7px", borderRadius: 5, fontFamily: "'JetBrains Mono',monospace" }}>{f}</span>))}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0, maxWidth: 500 }}>{q.why}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "12px 32px 20px", borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, alignItems: "center" }}>
                <button onClick={() => cq > 0 && setCq(c => c - 1)} disabled={cq === 0} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: cq === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: cq === 0 ? "default" : "pointer", fontFamily: "'Satoshi',sans-serif" }}>← Prev</button>
                <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
                  {QS.map((_, i) => (<button key={i} onClick={() => setCq(i)} style={{ width: cq === i ? 20 : 6, height: 6, borderRadius: 3, background: cq === i ? "#ff672a" : answers[i]?.trim() ? "rgba(255,103,42,0.4)" : "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />))}
                </div>
                <button onClick={() => { if (cq < 9) setCq(c => c + 1); else if (canGen) gen(); }} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: cq === 9 ? (canGen ? "linear-gradient(135deg,#ff672a,#ff9500)" : "rgba(255,255,255,0.06)") : "#ff672a", color: cq === 9 && !canGen ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 13, fontWeight: 600, cursor: cq === 9 && !canGen ? "default" : "pointer", fontFamily: "'Satoshi',sans-serif" }}>{cq === 9 ? "◆ Generate" : "Next →"}</button>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>Tab / ⇧Tab</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0c0c14", animation: "cfFadeIn 0.3s" }}>
              <CodeView content={(files || live)[sel] || ""} filename={sel} />
            </div>
          )}
        </div>

        {/* Right preview */}
        <div style={{ width: 300, borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>LIVE PREVIEW</span>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "rgba(22,163,74,0.15)", color: "#4ade80", fontWeight: 700 }}>LIVE</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: "#0c0c14" }}>
            <pre style={{ padding: "12px 16px", margin: 0, fontSize: 10.5, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono','SF Mono',monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{live[sel] || "..."}</pre>
          </div>
          <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.keys(live).map(f => (
              <button key={f} onClick={() => setSel(f)} style={{ padding: "3px 8px", borderRadius: 5, border: "none", background: f === sel ? "rgba(255,103,42,0.2)" : "rgba(255,255,255,0.04)", color: f === sel ? "#ff9966" : "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>{f}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
