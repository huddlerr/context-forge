/**
 * useAccessKey
 * Manages the access key state for gated integrations.
 * Persists the validated key token in localStorage.
 *
 * Returns:
 *   isUnlocked  – boolean: whether integrations are currently unlocked
 *   tier        – string | null: "pro" or custom tier from backend
 *   isChecking  – boolean: true while validating
 *   error       – string | null: last validation error
 *   validate    – async (key: string) => boolean
 *   lock        – () => void: clear the stored key
 */

import { useState, useCallback, useEffect } from "react";
import { LS } from "../data/localStorage";

const LS_KEY = "accessKey";
const LS_TIER = "accessTier";

// In dev mode we hit the local Vite dev server; in prod we hit the same origin
const API_BASE = import.meta.env.DEV ? "http://localhost:5173" : "";

export function useAccessKey() {
  const [isUnlocked, setIsUnlocked] = useState(() => !!LS.get(LS_KEY, null));
  const [tier, setTier] = useState(() => LS.get(LS_TIER, null));
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  // Re-hydrate on mount in case another tab changed LS
  useEffect(() => {
    const stored = LS.get(LS_KEY, null);
    setIsUnlocked(!!stored);
    setTier(LS.get(LS_TIER, null));
  }, []);

  const validate = useCallback(async (key) => {
    if (!key || !key.trim()) {
      setError("Please enter an access key.");
      return false;
    }
    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/validate-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        LS.set(LS_KEY, key.trim());
        LS.set(LS_TIER, data.tier || "pro");
        setIsUnlocked(true);
        setTier(data.tier || "pro");
        setError(null);
        return true;
      } else {
        setError(data.message || "Invalid key. Please try again.");
        return false;
      }
    } catch (e) {
      // In dev without a real KV, treat any network error gracefully
      if (import.meta.env.DEV) {
        console.warn("[useAccessKey] Dev mode: API not available, unlocking locally for testing.");
        LS.set(LS_KEY, key.trim());
        LS.set(LS_TIER, "pro");
        setIsUnlocked(true);
        setTier("pro");
        setError(null);
        return true;
      }
      setError("Could not reach the server. Check your connection.");
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const lock = useCallback(() => {
    LS.set(LS_KEY, null);
    LS.set(LS_TIER, null);
    setIsUnlocked(false);
    setTier(null);
    setError(null);
  }, []);

  return { isUnlocked, tier, isChecking, error, validate, lock };
}
