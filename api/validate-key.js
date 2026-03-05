/**
 * POST /api/validate-key
 * Body: { key: string }
 * Returns: { valid: boolean, tier?: string, message?: string }
 *
 * Validates an access key against Redis.
 * Keys are stored as: key:<sha256(key)> → JSON string { tier, createdAt, label, uses }
 */

import { createHash } from "crypto";
import { getRedis } from "./_redis.js";

export default async function handler(req, res) {
  // CORS
  const allowedOrigins = [
    "https://context-forge-eta.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173",
  ];
  const origin = req.headers.origin || "";
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ valid: false, message: "Method not allowed" });

  const { key } = req.body || {};
  if (!key || typeof key !== "string" || key.trim().length < 4) {
    return res.status(400).json({ valid: false, message: "Key is required" });
  }

  const hash = createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
  const kvKey = `key:${hash}`;

  let record;
  try {
    const redis = getRedis();
    const raw = await redis.get(kvKey);
    record = raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Redis error:", err);
    return res.status(503).json({ valid: false, message: "Service unavailable" });
  }

  if (!record) {
    return res.status(200).json({ valid: false, message: "Invalid key" });
  }

  // Increment usage counter (fire-and-forget)
  try {
    const redis = getRedis();
    redis.set(kvKey, JSON.stringify({ ...record, uses: (record.uses || 0) + 1, lastUsed: new Date().toISOString() })).catch(() => {});
  } catch {}

  return res.status(200).json({ valid: true, tier: record.tier || "pro", label: record.label || null });
}
