import { QS } from "../data/questions";
import { detectStack } from "./detectStack";
import { detectAuth } from "./detectAuth";
import { detectIntegrations } from "./detectIntegrations";
import { parseDataModel } from "./parseDataModel";
import { parseFlow } from "./parseFlow";

export function genFiles(answers) {
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
