import { STACK_PATTERNS } from "../data/stackPatterns";

export function detectStack(text) {
  const l = (text || "").toLowerCase();
  const det = {}, deps = {}, dev = {}, types = new Set();
  Object.entries(STACK_PATTERNS).forEach(([k, v]) => {
    if (l.includes(k)) { det[k] = v; Object.assign(deps, v.deps); Object.assign(dev, v.devDeps); types.add(v.type); }
  });
  return { detected: det, deps, devDeps: dev, types: [...types] };
}
