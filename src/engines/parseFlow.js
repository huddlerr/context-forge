export function parseFlow(t) {
  if (!t) return [];
  return t.split(/\d+[\.\)]\s*/).filter(Boolean).map((s, i) => ({
    number: i + 1,
    text: s.trim().replace(/→|->|-->/g, "").trim(),
  }));
}
