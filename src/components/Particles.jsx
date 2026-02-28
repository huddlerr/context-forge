export function Particles({ on }) {
  if (!on) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {Array.from({ length: 20 }, (_, i) => {
        const ang = (i / 20) * 360, dist = 30 + Math.random() * 70, sz = 3 + Math.random() * 4;
        return (<div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: sz, height: sz, borderRadius: "50%", background: ["#ff672a", "#ff9500", "#f59e0b", "#c084fc", "#38bdf8"][i % 5], animation: `cfPfly 1s ${Math.random() * 200}ms cubic-bezier(0.4,0,0.2,1) forwards`, "--dx": `${Math.cos(ang * Math.PI / 180) * dist}px`, "--dy": `${Math.sin(ang * Math.PI / 180) * dist}px` }} />);
      })}
    </div>
  );
}
