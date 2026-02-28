import { STACK_PATTERNS, StackPattern } from "../data/stackPatterns";

export interface StackResult {
  detected: Record<string, StackPattern>;
  deps: Record<string, string>;
  devDeps: Record<string, string>;
  types: string[];
}

export function detectStack(text: string): StackResult {
  const l = (text || "").toLowerCase();
  const det: Record<string, StackPattern> = {},
    deps: Record<string, string> = {},
    dev: Record<string, string> = {},
    types = new Set<string>();
  Object.entries(STACK_PATTERNS).forEach(([k, v]) => {
    if (l.includes(k)) {
      det[k] = v;
      Object.assign(deps, v.deps);
      Object.assign(dev, v.devDeps);
      types.add(v.type);
    }
  });
  return { detected: det, deps, devDeps: dev, types: [...types] };
}
