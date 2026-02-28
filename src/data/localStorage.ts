export const LS = {
  get: <T>(k: string, d: T): T => { try { const v = localStorage.getItem("cf_" + k); return v ? JSON.parse(v) as T : d; } catch { return d; } },
  set: (k: string, v: unknown): void => { try { localStorage.setItem("cf_" + k, JSON.stringify(v)); } catch {} },
  del: (k: string): void => { try { localStorage.removeItem("cf_" + k); } catch {} },
};
