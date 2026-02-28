export function parseDataModel(t) {
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
