// ── LOCAL STORAGE WRAPPER ─────────────────────────────────────
// Prefixed key-value persistence with JSON serialization.

export const LS = {
  get: (k, d) => { try { const v = localStorage.getItem("cf_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("cf_" + k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem("cf_" + k); } catch {} },
};
