import { useState, useRef, useEffect, useCallback } from "react";
import { QS } from "../data/questions";
import { copyAll } from "../exporters/clipboard";
import { Ring } from "../components/Ring";
import { Badges } from "../components/Badges";
import { CodeView } from "../components/CodeView";

export function Mobile({ answers, setAnswers, cq, setCq, files, setFiles, sel, setSel, conf, live, canGen, gen, ptcl, showSettings, showExport }) {
  const [tab, setTab] = useState("edit");
  const ref = useRef(null);
  const filled = answers.filter(a => a.trim()).length;
  const q = QS[cq];
  useEffect(() => { if (tab === "edit") setTimeout(() => ref.current?.focus(), 150); }, [cq, tab]);
  const upd = useCallback((v) => { setAnswers(p => { const n = [...p]; n[cq] = v; return n; }); }, [cq, setAnswers]);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#0a0a0f", color: "white", fontFamily: "'Satoshi',sans-serif", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#ff672a,#ff9500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>✦</div>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Context Forge</h1>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>{filled}/10</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={showSettings} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</button>
          <Ring value={conf.overall} size={30} stroke={2.5} />
          <button onClick={files ? showExport : (canGen ? gen : undefined)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: files ? "#16a34a" : canGen ? "linear-gradient(135deg,#ff672a,#ff9500)" : "rgba(255,255,255,0.06)", color: files ? "#fff" : canGen ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 700, cursor: canGen || files ? "pointer" : "default" }}>
            {files ? "⬆ Export" : "◆ Generate"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {tab === "edit" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "cfFadeIn 0.2s" }}>
            <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", flexShrink: 0, WebkitOverflowScrolling: "touch" }}>
              {QS.map((qu, i) => {
                const sc = conf.individual[qu.id] || 0, act = cq === i;
                return (
                  <button key={qu.id} onClick={() => setCq(i)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, background: act ? "rgba(255,103,42,0.15)" : sc > 0 ? "rgba(255,255,255,0.04)" : "transparent", border: act ? "1.5px solid rgba(255,103,42,0.3)" : "1px solid rgba(255,255,255,0.06)", flexShrink: 0, cursor: "pointer" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: act ? "#ff672a" : sc > 0 ? qu.color : "rgba(255,255,255,0.25)" }}>{qu.id}</span>
                    <span style={{ fontSize: 11, fontWeight: act ? 600 : 400, color: act ? "#fff" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{qu.label}</span>
                    {sc > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc >= 0.8 ? "#16a34a" : "#f59e0b" }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "8px 16px 0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{q.icon}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, flex: 1 }}>{q.title}</h2>
                <Ring value={conf.individual[q.id] || 0} size={26} stroke={2.5} />
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, margin: "0 0 8px" }}>{q.sub}</p>
            </div>
            <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 8, overflow: "hidden", minHeight: 0 }}>
              <textarea ref={ref} value={answers[cq]} onChange={e => upd(e.target.value)} placeholder={q.ph}
                style={{ flex: 1, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "12px 14px", fontSize: 15, lineHeight: 1.6, color: "#fff", resize: "none", outline: "none", minHeight: 80, fontFamily: "'Satoshi',sans-serif" }}
                onFocus={e => { e.target.style.borderColor = "#ff672a44"; e.target.style.background = "rgba(255,103,42,0.03)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)"; }} />
              <Badges answers={answers} qi={cq} compact />
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>→</span>
                {q.out.map(f => (<span key={f} style={{ fontSize: 9, fontWeight: 600, color: "#ff9966", background: "rgba(255,103,42,0.1)", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono',monospace" }}>{f}</span>))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "10px 16px", flexShrink: 0 }}>
              <button onClick={() => cq > 0 && setCq(c => c - 1)} disabled={cq === 0} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: cq === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: cq === 0 ? "default" : "pointer", fontFamily: "'Satoshi',sans-serif" }}>←</button>
              <button onClick={() => { if (cq < 9) setCq(c => c + 1); else if (canGen) gen(); }} style={{ flex: 3, padding: "12px", borderRadius: 10, border: "none", background: cq === 9 ? (canGen ? "linear-gradient(135deg,#ff672a,#ff9500)" : "rgba(255,255,255,0.06)") : "#ff672a", color: cq === 9 && !canGen ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 14, fontWeight: 700, cursor: cq === 9 && !canGen ? "default" : "pointer", fontFamily: "'Satoshi',sans-serif" }}>{cq === 9 ? "◆ Generate" : "Next →"}</button>
            </div>
          </div>
        )}
        {tab === "files" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "cfFadeIn 0.2s" }}>
            <div style={{ display: "flex", gap: 4, padding: "10px 12px", overflowX: "auto", flexShrink: 0, WebkitOverflowScrolling: "touch" }}>
              {Object.keys(files || live).map(f => (
                <button key={f} onClick={() => setSel(f)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", whiteSpace: "nowrap", background: f === sel ? "rgba(255,103,42,0.2)" : "rgba(255,255,255,0.04)", color: f === sel ? "#ff9966" : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>{f}</button>
              ))}
            </div>
            <div style={{ flex: 1, background: "#0c0c14", overflow: "hidden" }}>
              <CodeView content={(files || live)[sel] || ""} filename={sel} compact />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{Object.keys(files || live).length} files</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => copyAll(files || live)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Copy All</button>
                {files && <button onClick={showExport} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#ff672a", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Export ⬆</button>}
              </div>
            </div>
          </div>
        )}
        {tab === "graph" && (
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", animation: "cfFadeIn 0.2s" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Coverage</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
              {QS.map((qu, i) => (
                <button key={qu.id} onClick={() => { setCq(i); setTab("edit"); }} style={{ padding: "10px 4px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Ring value={conf.individual[qu.id] || 0} size={28} stroke={2.5} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Q{qu.id}</span>
                </button>
              ))}
            </div>
            {conf.issues.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Issues ({conf.issues.length})</div>
              {conf.issues.map((is, i) => (
                <button key={i} onClick={() => { setCq(is.q - 1); setTab("edit"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", marginBottom: 6, width: "100%", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", width: 24, height: 24, borderRadius: 6, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{is.q}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{is.l}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{is.m}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Fix →</span>
                </button>
              ))}
            </>}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)", paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        {[{ id: "edit", label: "Questions", icon: "✦" }, { id: "files", label: "Files", icon: "◈" }, { id: "graph", label: "Status", icon: "◐" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 6px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "'Satoshi',sans-serif" }}>
            <span style={{ fontSize: 18, opacity: tab === t.id ? 1 : 0.35, transition: "opacity 0.15s" }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: tab === t.id ? "#ff672a" : "rgba(255,255,255,0.3)", transition: "color 0.15s" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
