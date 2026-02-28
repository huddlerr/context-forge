export interface FlowStep {
  number: number;
  text: string;
}

export function parseFlow(t: string): FlowStep[] {
  if (!t) return [];
  return t
    .split(/\d+[.)]\s*/)
    .filter(Boolean)
    .map((s, i) => ({
      number: i + 1,
      text: s.trim().replace(/→|->|-->/g, "").trim(),
    }));
}
