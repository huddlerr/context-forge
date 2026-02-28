import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ══════════════════════════════════════════════════════════════
   CONTEXT FORGE — Standalone Product
   10 Questions → Project Scaffold → Export Anywhere
   Airtable · Google Sheets · ZIP · Clipboard
   Responsive: Desktop 3-panel IDE + Mobile tabbed
   ══════════════════════════════════════════════════════════════ */

// ── RESPONSIVE HOOK ──────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < bp);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [bp]);
  return m;
}

// ── LOCAL STORAGE ────────────────────────────────────────────
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem("cf_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("cf_" + k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem("cf_" + k); } catch {} },
};

// ── STACK DETECTION ENGINE ───────────────────────────────────
const STACK_PATTERNS = {
  "expo": { deps: { "expo": "~52.0.0", "expo-router": "~4.0.0" }, devDeps: { "@babel/core": "^7.24.0" }, type: "mobile" },
  "react native": { deps: { "react-native": "0.76.0" }, devDeps: {}, type: "mobile" },
  "next": { deps: { "next": "15.0.0", "react": "^19.0.0", "react-dom": "^19.0.0" }, devDeps: { "typescript": "^5" }, type: "web" },
  "remix": { deps: { "@remix-run/react": "^2.0.0" }, devDeps: { "typescript": "^5" }, type: "web" },
  "vite": { deps: { "react": "^18.3.0", "react-dom": "^18.3.0" }, devDeps: { "vite": "^6.0.0" }, type: "web" },
  "convex": { deps: { "convex": "^1.17.0" }, devDeps: {}, type: "backend" },
  "supabase": { deps: { "@supabase/supabase-js": "^2.45.0" }, devDeps: {}, type: "backend" },
  "firebase": { deps: { "firebase": "^11.0.0" }, devDeps: {}, type: "backend" },
  "clerk": { deps: { "@clerk/clerk-expo": "^2.5.0" }, devDeps: {}, type: "auth" },
  "nativewind": { deps: { "nativewind": "^4.0.0" }, devDeps: { "tailwindcss": "^3.4.0" }, type: "styling" },
  "tailwind": { deps: { "tailwindcss": "^3.4.0" }, devDeps: { "postcss": "^8.4.0" }, type: "styling" },
  "zustand": { deps: { "zustand": "^5.0.0" }, devDeps: {}, type: "state" },
  "stripe": { deps: { "stripe": "^17.0.0" }, devDeps: {}, type: "payments" },
  "typescript": { deps: {}, devDeps: { "typescript": "^5.6.0" }, type: "lang" },
  "gemini": { deps: { "@google/generative-ai": "^0.21.0" }, devDeps: {}, type: "ai" },
  "openai": { deps: { "openai": "^4.70.0" }, devDeps: {}, type: "ai" },
  "sentry": { deps: { "@sentry/react-native": "^6.0.0" }, devDeps: {}, type: "monitoring" },
  "foursquare": { deps: {}, devDeps: {}, type: "api" },
  "drizzle": { deps: { "drizzle-orm": "^0.35.0" }, devDeps: { "drizzle-kit": "^0.25.0" }, type: "orm" },
  "prisma": { deps: { "@prisma/client": "^6.0.0" }, devDeps: { "prisma": "^6.0.0" }, type: "orm" },
};

function detectStack(text) {
  const l = (text || "").toLowerCase();
  const det = {}, deps = {}, dev = {}, types = new Set();
  Object.entries(STACK_PATTERNS).forEach(([k, v]) => {
    if (l.includes(k)) { det[k] = v; Object.assign(deps, v.deps); Object.assign(dev, v.devDeps); types.add(v.type); }
  });
  return { detected: det, deps, devDeps: dev, types: [...types] };
}

function detectAuth(t) {
  const l = (t || "").toLowerCase(), r = [];
  if (l.includes("clerk")) r.push({ p: "Clerk", k: ["CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"] });
  if (l.includes("supabase")) r.push({ p: "Supabase Auth", k: ["SUPABASE_URL", "SUPABASE_ANON_KEY"] });
  if (l.includes("firebase")) r.push({ p: "Firebase Auth", k: ["FIREBASE_API_KEY"] });
  if (l.includes("google") || l.includes("oauth")) r.push({ p: "Google OAuth", k: ["GOOGLE_CLIENT_ID"] });
  if (l.includes("email") || l.includes("password")) r.push({ p: "Email/Password", k: [] });
  return r;
}

function detectIntegrations(t) {
  const l = (t || "").toLowerCase(), r = [];
  if (l.includes("gemini")) r.push({ n: "Google Gemini", k: ["GEMINI_API_KEY"] });
  if (l.includes("openai") || l.includes("gpt")) r.push({ n: "OpenAI", k: ["OPENAI_API_KEY"] });
  if (l.includes("stripe")) r.push({ n: "Stripe", k: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"] });
  if (l.includes("sentry")) r.push({ n: "Sentry", k: ["SENTRY_DSN"] });
  if (l.includes("foursquare")) r.push({ n: "Foursquare", k: ["FOURSQUARE_API_KEY"] });
  if (l.includes("resend")) r.push({ n: "Resend", k: ["RESEND_API_KEY"] });
  return r;
}

function parseDataModel(t) {
  if (!t) return [];
  const e = [];
  (t.match(/(\w[\w\s]*?)\s*[\(:]([^)]+)[\)]?/g) || []).forEach(p => {
    const m = p.match(/(\w[\w\s]*?)\s*[\(:](.+)/);
    if (m) {
      const n = m[1].trim();
      const f = m[2].replace(/\)$/, "").split(/[,.]/).map(x => x.trim()).filter(Boolean).map(x => {
        const pp = x.split(/\s+/);
        return { name: pp[0], type: pp[1] || "string" };
      });
      if (n && f.length) e.push({ name: n, fields: f });
    }
  });
  return e;
}

function parseFlow(t) {
  if (!t) return [];
  return t.split(/\d+[\.\)]\s*/).filter(Boolean).map((s, i) => ({
    number: i + 1,
    text: s.trim().replace(/→|->|-->/g, "").trim(),
  }));
}

// ── QUESTIONS ────────────────────────────────────────────────
const QS = [
  { id: 1, label: "Soul", icon: "✦", color: "#ff672a", title: "What's the ONE thing?", sub: "The single core feature in one sentence.", ph: '"Users create and organize travel group logistics with venue voting"', out: ["soul.md"], why: "Defines atomic value. soul.md becomes the north star.", w: 1.0 },
  { id: 2, label: "User", icon: "◉", color: "#e85d26", title: "Who picks this up?", sub: "Primary user. Age, context, what they escape FROM.", ph: '"Youth soccer families (parents 30-50). Phone at tournaments."', out: ["soul.md", "design.md"], why: "Drives every design decision.", w: 0.9 },
  { id: 3, label: "Stack", icon: "⚙", color: "#d95422", title: "What's the stack?", sub: "Framework, backend, database.", ph: '"Expo SDK 55, Convex, NativeWind, Zustand, TypeScript"', out: ["package.json", "tsconfig.json", "claude.md"], why: "Auto-detects real npm packages.", w: 1.0, smart: true },
  { id: 4, label: "Data", icon: "◈", color: "#cc4b1e", title: "What's the data model?", sub: "Core entities and fields.", ph: '"Trips (name, destination, date_range, owner_id). Members (user_id, trip_id, role)."', out: ["types.ts", "claude.md"], why: "Generates TypeScript interfaces.", w: 1.0, smart: true },
  { id: 5, label: "Flow", icon: "→", color: "#bf421a", title: "What's the user flow?", sub: "Screen → action → Screen. Max 6 steps.", ph: '"1. Open → trips list  2. Tap + → create  3. Share link → join"', out: ["claude.md", "README.md"], why: "This IS the build order.", w: 0.9, smart: true },
  { id: 6, label: "Vibe", icon: "◐", color: "#b23916", title: "What's the vibe?", sub: "Colors, mood, light/dark?", ph: '"Energetic but clean. Blue (#2563eb) + white. Inter. Rounded."', out: ["design.md"], why: "Complete design token system.", w: 0.7 },
  { id: 7, label: "Auth", icon: "◑", color: "#a53012", title: "Auth & permissions?", sub: "How users get in. Roles.", ph: '"Email/password + Google via Clerk. owner + member roles."', out: [".env.example", "claude.md"], why: "Auth touches every layer.", w: 0.9, smart: true },
  { id: 8, label: "APIs", icon: "⊕", color: "#98270e", title: "What plugs in?", sub: "Third-party services, AI, payments.", ph: '"Foursquare Places. Gemini 2.5 Flash. Stripe."', out: [".env.example", "claude.md"], why: "Each needs env vars + wrapper.", w: 0.7, smart: true },
  { id: 9, label: "Rules", icon: "⊘", color: "#8b1e0a", title: "Hard rules?", sub: "Constraints, forbidden patterns.", ph: '"NativeWind only. Offline. 60fps. All text ≥14px."', out: [".cursorrules"], why: "Guardrails prevent rewrites.", w: 0.6 },
  { id: 10, label: "Done", icon: "◆", color: "#7e1506", title: "What does DONE look like?", sub: "v1 acceptance criteria.", ph: '"Create/join trips. Invite link. Vote venues. TestFlight."', out: ["README.md", "TASKS.md"], why: "So agents know when to STOP.", w: 0.8 },
];

// ── FILE GENERATION ENGINE ───────────────────────────────────
function genFiles(answers) {
  const a = {};
  QS.forEach((q, i) => { a[q.id] = answers[i] || ""; });
  const stk = detectStack(a[3]);
  const auth = detectAuth(a[7]);
  const ints = detectIntegrations(a[8]);
  const ents = parseDataModel(a[4]);
  const flow = parseFlow(a[5]);
  const slug = (a[1] || "my-app").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").substring(0, 40);

  const soul = `# Soul — North Star\n\n## The One Thing\n${a[1] || "[Q1]"}\n\n## Who\n${a[2] || "[Q2]"}\n\n## Voice\n- Teammate, not manual\n- Warm but efficient\n- Errors help, never blame\n\n## Test: "Does this serve THE ONE THING?"\n> No → cut. Maybe → defer. Yes → build beautifully.\n`;

  const design = `# Design System\n\n## User: ${a[2] || "[Q2]"}\n## Vibe: ${a[6] || "[Q6]"}\n\n## Tokens\n\`\`\`\nColors: bg, surface, primary, text, muted, destructive, success\nText: xs:12 sm:14 base:16 lg:18 xl:20 2xl:24 display:40\nSpacing: 4 8 12 16 24 32 48 64\nRadii: sm:8 md:12 lg:16 xl:20\n\`\`\`\n\n## Components\n${flow.map((s, i) => `${i + 1}. ${s.text}`).join("\n") || "[Q5]"}\n`;

  const claude = `# claude.md\n\n> Read soul.md first. design.md before UI.\n\n## Overview: ${a[1] || "[Q1]"}\n## User: ${a[2] || "[Q2]"}\n## Stack: ${a[3] || "[Q3]"}${stk.types.length ? `\nDetected: ${Object.keys(stk.detected).join(", ")}` : ""}\n\n## Data\n${a[4] || "[Q4]"}${ents.length ? "\n" + ents.map(e => `- **${e.name}**: ${e.fields.map(f => f.name).join(", ")}`).join("\n") : ""}\n\n## Build Order\n${flow.length ? flow.map(s => `${s.number}. ${s.text}`).join("\n") : a[5] || "[Q5]"}\n\n## Auth: ${a[7] || "[Q7]"}${auth.length ? ` → ${auth.map(p => p.p).join(", ")}` : ""}\n## Integrations: ${a[8] || "[Q8]"}${ints.length ? ` → ${ints.map(i => i.n).join(", ")}` : ""}\n## Guardrails: ${a[9] || "[Q9]"}\n## Done: ${a[10] || "[Q10]"}\n\n## Style: TS strict. Functional. Named exports. Error boundaries.\n`;

  const scripts = stk.types.includes("mobile") ? { start: "expo start", ios: "expo start --ios", android: "expo start --android" } : { dev: "next dev || vite", build: "next build || vite build" };
  const pkg = JSON.stringify({ name: slug, version: "0.1.0", private: true, scripts, dependencies: stk.deps, devDependencies: stk.devDeps }, null, 2);

  const tsconf = JSON.stringify({ compilerOptions: { strict: true, target: "expo" in stk.detected ? "ESNext" : "ES2022", module: "ESNext", moduleResolution: "bundler", jsx: "react-jsx", esModuleInterop: true, skipLibCheck: true, noEmit: true, baseUrl: ".", paths: { "@/*": ["./src/*"] } }, include: ["**/*.ts", "**/*.tsx"], exclude: ["node_modules"] }, null, 2);

  const envL = ["# .env.example\n"];
  if (auth.length) { envL.push("# Auth"); auth.forEach(p => p.k.forEach(k => envL.push(`${k}=`))); envL.push(""); }
  if (ints.length) { envL.push("# Integrations"); ints.forEach(ig => { envL.push(`# ${ig.n}`); ig.k.forEach(k => envL.push(`${k}=`)); }); envL.push(""); }
  if ("convex" in stk.detected) envL.push("CONVEX_DEPLOYMENT=\n");
  envL.push("NODE_ENV=development");

  let types = "// types.ts\n\n";
  if (ents.length) {
    ents.forEach(e => {
      types += `export interface ${e.name} {\n  id: string;\n`;
      e.fields.forEach(f => {
        const t = f.name.includes("_id") ? "string" : f.name.includes("_at") || f.name.includes("date") ? "Date" : f.name.includes("amount") || f.name.includes("price") ? "number" : f.name.includes("is_") ? "boolean" : "string";
        types += `  ${f.name}: ${t};\n`;
      });
      types += `  created_at: Date;\n  updated_at: Date;\n}\n\n`;
    });
  } else {
    types += "// Describe data in Q4 to auto-generate\n";
  }

  const readme = `# ${a[1] || "Project"}\n\n${a[1] || "[Q1]"}\n\n## Stack: ${a[3] || "[Q3]"}\n\n\`\`\`bash\nnpm install && npm ${stk.types.includes("mobile") ? "start" : "run dev"}\n\`\`\`\n\n## Flow\n${flow.length ? flow.map(s => `${s.number}. ${s.text}`).join("\n") : "[Q5]"}\n\n## Done: ${a[10] || "[Q10]"}\n`;

  const tasks = `# TASKS\n\n## Phase 0: Scaffold\n- [ ] Init + deps + TS\n\n## Phase 1: Foundation\n- [ ] Theme + Auth${auth.length ? ` (${auth.map(p => p.p).join(", ")})` : ""} + Nav\n\n## Phase 2: Core\n${flow.length ? flow.map(s => `- [ ] ${s.text}`).join("\n") : "- [ ] [Q5]"}\n\n## Phase 3: Integrations\n${ints.length ? ints.map(ig => `- [ ] ${ig.n}`).join("\n") : "- [ ] [Q8]"}\n\n## Phase 4: Polish + Ship\n- [ ] States + a11y + deploy\n`;

  const rules = `# .cursorrules\n\n${a[9] || "[Q9]"}\n\nStack: ${a[3] || "[Q3]"}\n\nAlways: claude.md → design.md → soul.md. TS strict. No any.\nNever: Skip errors. Hardcode keys. Add unplanned features.\n`;

  return { "soul.md": soul, "design.md": design, "claude.md": claude, "package.json": pkg, "tsconfig.json": tsconf, ".env.example": envL.join("\n"), "types.ts": types, "README.md": readme, "TASKS.md": tasks, ".cursorrules": rules };
}

// ── CONFIDENCE ENGINE ────────────────────────────────────────
function calcConf(answers) {
  const sc = {}, iss = [];
  QS.forEach((q, i) => {
    const len = (answers[i] || "").trim().length;
    let s = len === 0 ? 0 : len < 20 ? 0.3 : len < 60 ? 0.6 : len < 150 ? 0.85 : 0.95;
    if (len === 0) iss.push({ q: q.id, l: q.label, m: "Empty — needed for " + q.out.join(", ") });
    else if (len < 20) iss.push({ q: q.id, l: q.label, m: "Very brief" });
    if (q.id === 3 && detectStack(answers[i]).types.length) s = Math.min(1, s + 0.1);
    if (q.id === 4 && parseDataModel(answers[i]).length) s = Math.min(1, s + 0.1);
    if (q.id === 7 && detectAuth(answers[i]).length) s = Math.min(1, s + 0.1);
    if (q.id === 8 && detectIntegrations(answers[i]).length) s = Math.min(1, s + 0.1);
    sc[q.id] = Math.min(1, s);
  });
  let tw = 0, ws = 0;
  QS.forEach(q => { tw += q.w; ws += sc[q.id] * q.w; });
  return { individual: sc, overall: tw > 0 ? ws / tw : 0, issues: iss };
}

// ── EXPORT ENGINES ───────────────────────────────────────────
async function exportToAirtable(config, answers, files) {
  const { apiKey, baseId, tableId } = config;
  if (!apiKey || !baseId || !tableId) throw new Error("Missing Airtable config");
  const slug = (answers[0] || "untitled").substring(0, 40);
  const conf = calcConf(answers);
  const fields = {
    "Project": slug,
    "Soul": answers[0] || "",
    "User": answers[1] || "",
    "Stack": answers[2] || "",
    "Data Model": answers[3] || "",
    "User Flow": answers[4] || "",
    "Vibe": answers[5] || "",
    "Auth": answers[6] || "",
    "APIs": answers[7] || "",
    "Rules": answers[8] || "",
    "Done Criteria": answers[9] || "",
    "Confidence": Math.round(conf.overall * 100),
    "Files Generated": Object.keys(files).join(", "),
    "Generated At": new Date().toISOString(),
  };
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Airtable error ${res.status}`);
  }
  return await res.json();
}

async function exportToSheets(config, answers, files) {
  const { apiKey, sheetId, sheetName } = config;
  if (!apiKey || !sheetId) throw new Error("Missing Google Sheets config");
  const tab = sheetName || "Sheet1";
  const conf = calcConf(answers);
  const values = [[
    (answers[0] || "untitled").substring(0, 40),
    ...answers,
    Math.round(conf.overall * 100),
    Object.keys(files).join(", "),
    new Date().toISOString(),
  ]];
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}!A:O:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values }) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sheets error ${res.status}`);
  }
  return await res.json();
}

function downloadZip(files) {
  // Simple multi-file download as concatenated text (no library needed)
  // For real ZIP, we'd use JSZip — but keeping zero-dep for now
  const content = Object.entries(files).map(([name, body]) =>
    `${"=".repeat(60)}\n== ${name}\n${"=".repeat(60)}\n\n${body}`
  ).join("\n\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "context-forge-scaffold.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function copyAll(files) {
  const content = Object.entries(files).map(([n, c]) => `== ${n} ==\n\n${c}`).join("\n\n");
  navigator.clipboard?.writeText(content);
}

// ── SHARED COMPONENTS ────────────────────────────────────────
function Ring({ value, size = 40, stroke = 3.5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const col = value >= 0.8 ? "#16a34a" : value >= 0.5 ? "#f59e0b" : value > 0 ? "#ef4444" : "rgba(255,255,255,0.1)";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - value * c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={col}
        fontSize={size * 0.28} fontWeight="700" fontFamily="'JetBrains Mono',monospace"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{Math.round(value * 100)}</text>
    </svg>
  );
}

function Badges({ answers, qi, compact }) {
  const q = QS[qi], ans = answers[qi] || "";
  if (!q.smart || ans.trim().length < 3) return null;
  let d = [];
  if (q.id === 3) d = Object.keys(detectStack(ans).detected);
  else if (q.id === 4) d = parseDataModel(ans).map(e => e.name);
  else if (q.id === 5) d = parseFlow(ans).map(s => `Step ${s.number}`);
  else if (q.id === 7) d = detectAuth(ans).map(p => p.p);
  else if (q.id === 8) d = detectIntegrations(ans).map(i => i.n);
  if (!d.length) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", animation: "cfFadeIn 0.3s" }}>
      <span style={{ fontSize: compact ? 9 : 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, lineHeight: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Detected:</span>
      {d.map((item, i) => (
        <span key={i} style={{ fontSize: compact ? 10 : 11, fontWeight: 600, color: "#ff9966", background: "rgba(255,103,42,0.12)", border: "1px solid rgba(255,103,42,0.2)", padding: compact ? "1px 6px" : "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono',monospace", display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff672a" }} />{item}
        </span>
      ))}
    </div>
  );
}

function CodeView({ content, filename, compact }) {
  const [cp, setCp] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(content); setCp(true); setTimeout(() => setCp(false), 2000); };
  const html = useMemo(() => {
    if (!content) return "";
    return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\/.*$|#.*$)/gm, '<span style="color:#6b7280">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#f59e0b">$1</span>')
      .replace(/\b(export|import|interface|type|const|let|function|return|from|true|false|null)\b/g, '<span style="color:#c084fc">$1</span>')
      .replace(/\b(string|number|boolean|Date|void)\b/g, '<span style="color:#38bdf8">$1</span>');
  }, [content]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: compact ? "8px 12px" : "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff672a" }} />
          <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'JetBrains Mono',monospace" }}>{filename}</span>
        </div>
        <button onClick={copy} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: cp ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.04)", color: cp ? "#4ade80" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>
          {cp ? "✓ Copied" : "Copy"}</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: compact ? "8px 0" : "12px 0" }}>
        <pre style={{ margin: 0, padding: compact ? "0 12px" : "0 16px" }}>
          <code style={{ fontSize: compact ? 11 : 12, lineHeight: 1.7, fontFamily: "'JetBrains Mono','SF Mono',monospace", color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}

function Particles({ on }) {
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

// ── INTEGRATIONS PANEL (Settings Sheet) ──────────────────────
const INTEGRATIONS = [
  { id: "airtable", name: "Airtable", icon: "📊", color: "#18BFFF", desc: "Push project scaffolds to an Airtable base", fields: [
    { key: "apiKey", label: "Personal Access Token", type: "password", ph: "pat..." },
    { key: "baseId", label: "Base ID", ph: "appXXXXXXXX" },
    { key: "tableId", label: "Table Name", ph: "Projects" },
  ]},
  { id: "gsheets", name: "Google Sheets", icon: "📗", color: "#0F9D58", desc: "Append rows to a Google Sheet", fields: [
    { key: "apiKey", label: "API Key", type: "password", ph: "AIza..." },
    { key: "sheetId", label: "Sheet ID", ph: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" },
    { key: "sheetName", label: "Tab Name", ph: "Sheet1" },
  ]},
];

function SettingsPanel({ show, onClose, integrations, setIntegrations }) {
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState({});

  if (!show) return null;

  const update = (intId, field, value) => {
    setIntegrations(prev => ({ ...prev, [intId]: { ...prev[intId], [field]: value } }));
  };

  const testConnection = async (intId) => {
    setTesting(intId);
    setTestResult(prev => ({ ...prev, [intId]: null }));
    try {
      const cfg = integrations[intId] || {};
      if (intId === "airtable") {
        const res = await fetch(`https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableId || "Projects")}?maxRecords=1`, {
          headers: { Authorization: `Bearer ${cfg.apiKey}` },
        });
        if (res.ok) setTestResult(prev => ({ ...prev, [intId]: "success" }));
        else throw new Error(`${res.status}`);
      } else if (intId === "gsheets") {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.sheetId}?key=${cfg.apiKey}&fields=properties.title`);
        if (res.ok) setTestResult(prev => ({ ...prev, [intId]: "success" }));
        else throw new Error(`${res.status}`);
      }
    } catch (e) {
      setTestResult(prev => ({ ...prev, [intId]: "error" }));
    }
    setTesting(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(560px, 92vw)", maxHeight: "80vh", background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>Integrations</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Connect your tools to export scaffolds</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
          {INTEGRATIONS.map(int => {
            const cfg = integrations[int.id] || {};
            const connected = int.fields.every(f => cfg[f.key]?.trim());
            const tr = testResult[int.id];
            return (
              <div key={int.id} style={{ marginBottom: 20, padding: 16, borderRadius: 12, border: `1px solid ${connected ? int.color + "33" : "rgba(255,255,255,0.06)"}`, background: connected ? int.color + "08" : "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{int.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{int.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{int.desc}</div>
                  </div>
                  {connected && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: tr === "success" ? "rgba(22,163,74,0.2)" : tr === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)", color: tr === "success" ? "#4ade80" : tr === "error" ? "#ef4444" : "rgba(255,255,255,0.4)" }}>
                      {tr === "success" ? "✓ Connected" : tr === "error" ? "✗ Failed" : "Configured"}
                    </span>
                  )}
                </div>
                {int.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={cfg[f.key] || ""}
                      onChange={e => update(int.id, f.key, e.target.value)}
                      placeholder={f.ph}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", outline: "none" }}
                    />
                  </div>
                ))}
                {connected && (
                  <button onClick={() => testConnection(int.id)} disabled={testing === int.id}
                    style={{ marginTop: 4, padding: "6px 14px", borderRadius: 6, border: "none", background: int.color + "22", color: int.color, fontSize: 11, fontWeight: 700, cursor: testing === int.id ? "wait" : "pointer" }}>
                    {testing === int.id ? "Testing..." : "Test Connection"}
                  </button>
                )}
              </div>
            );
          })}
          <div style={{ padding: 16, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>More integrations coming — Notion, Linear, CSV, GitHub</p>
          </div>
        </div>
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => { LS.set("integrations", integrations); onClose(); }}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#ff672a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

// ── EXPORT MENU ──────────────────────────────────────────────
function ExportMenu({ show, onClose, files, answers, integrations, onExport }) {
  const [status, setStatus] = useState({});

  if (!show) return null;

  const doExport = async (target) => {
    setStatus(p => ({ ...p, [target]: "loading" }));
    try {
      if (target === "clipboard") { copyAll(files); setStatus(p => ({ ...p, [target]: "done" })); }
      else if (target === "download") { downloadZip(files); setStatus(p => ({ ...p, [target]: "done" })); }
      else if (target === "airtable") { await exportToAirtable(integrations.airtable || {}, answers, files); setStatus(p => ({ ...p, [target]: "done" })); }
      else if (target === "gsheets") { await exportToSheets(integrations.gsheets || {}, answers, files); setStatus(p => ({ ...p, [target]: "done" })); }
      setTimeout(() => setStatus(p => ({ ...p, [target]: null })), 3000);
      if (onExport) onExport(target);
    } catch (e) {
      setStatus(p => ({ ...p, [target]: "error" }));
      setTimeout(() => setStatus(p => ({ ...p, [target]: null })), 3000);
    }
  };

  const atCfg = integrations.airtable || {};
  const gsCfg = integrations.gsheets || {};
  const atReady = atCfg.apiKey && atCfg.baseId;
  const gsReady = gsCfg.apiKey && gsCfg.sheetId;

  const targets = [
    { id: "clipboard", icon: "📋", name: "Copy All", desc: "All files to clipboard", ready: true },
    { id: "download", icon: "💾", name: "Download", desc: "Save as text bundle", ready: true },
    { id: "airtable", icon: "📊", name: "Airtable", desc: atReady ? "Push to " + (atCfg.tableId || "Projects") : "Not configured", ready: atReady, color: "#18BFFF" },
    { id: "gsheets", icon: "📗", name: "Google Sheets", desc: gsReady ? "Append row" : "Not configured", ready: gsReady, color: "#0F9D58" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(420px, 90vw)", background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "20px 24px 12px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>Export Scaffold</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>{Object.keys(files).length} files ready</p>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          {targets.map(t => {
            const st = status[t.id];
            return (
              <button key={t.id} onClick={() => t.ready && doExport(t.id)} disabled={!t.ready || st === "loading"}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", marginBottom: 6, background: st === "done" ? "rgba(22,163,74,0.1)" : st === "error" ? "rgba(239,68,68,0.1)" : t.ready ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)", border: `1px solid ${st === "done" ? "rgba(22,163,74,0.2)" : st === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, cursor: t.ready ? "pointer" : "default", opacity: t.ready ? 1 : 0.4, textAlign: "left" }}>
                <span style={{ fontSize: 22 }}>{st === "done" ? "✓" : st === "error" ? "✗" : t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: st === "done" ? "#4ade80" : st === "error" ? "#ef4444" : "#fff" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: st === "done" ? "#4ade80" : st === "error" ? "#ef4444" : "rgba(255,255,255,0.3)" }}>
                    {st === "done" ? "Done!" : st === "error" ? "Failed — check settings" : st === "loading" ? "Exporting..." : t.desc}
                  </div>
                </div>
                {!t.ready && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Setup →</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE LAYOUT
// ═══════════════════════════════════════════════════════════════
function Mobile({ answers, setAnswers, cq, setCq, files, setFiles, sel, setSel, conf, live, canGen, gen, ptcl, showSettings, showExport }) {
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

// ═══════════════════════════════════════════════════════════════
// DESKTOP LAYOUT
// ═══════════════════════════════════════════════════════════════
function Desktop({ answers, setAnswers, cq, setCq, files, setFiles, sel, setSel, conf, live, canGen, gen, ptcl, showSettings, showExport }) {
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

// ═══════════════════════════════════════════════════════════════
// MAIN APP — RESPONSIVE ROUTER + STATE
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const isMobile = useIsMobile();
  const [cq, setCq] = useState(0);
  const [answers, setAnswers] = useState(() => LS.get("answers", Array(10).fill("")));
  const [files, setFiles] = useState(null);
  const [sel, setSel] = useState("soul.md");
  const [ptcl, setPtcl] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [integrations, setIntegrations] = useState(() => LS.get("integrations", {}));

  // Persist answers
  useEffect(() => { LS.set("answers", answers); }, [answers]);
  useEffect(() => { LS.set("integrations", integrations); }, [integrations]);

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

  const props = {
    answers, setAnswers, cq, setCq, files, setFiles, sel, setSel,
    conf, live, canGen, gen, ptcl,
    showSettings: () => setSettingsOpen(true),
    showExport: () => setExportOpen(true),
  };

  return (
    <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes cfFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cfPulse { 0%,100% { box-shadow: 0 0 20px rgba(255,103,42,0.15); } 50% { box-shadow: 0 0 40px rgba(255,103,42,0.3); } }
        @keyframes cfPfly { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--dx),var(--dy)) scale(0); opacity: 0; } }
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        html,body{margin:0;padding:0;height:100%;overflow:hidden}
        #root{height:100%}
        button{font-family:'Satoshi',sans-serif}
        textarea{font-family:'Satoshi',sans-serif}
        textarea::placeholder{color:rgba(255,255,255,0.2)}
        input::placeholder{color:rgba(255,255,255,0.2)}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
      `}</style>
      <Particles on={ptcl} />
      <SettingsPanel show={settingsOpen} onClose={() => setSettingsOpen(false)} integrations={integrations} setIntegrations={setIntegrations} />
      <ExportMenu show={exportOpen} onClose={() => setExportOpen(false)} files={files || live} answers={answers} integrations={integrations} />
      {isMobile ? <Mobile {...props} /> : <Desktop {...props} />}
    </>
  );
}
