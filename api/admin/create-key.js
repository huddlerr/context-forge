/**
 * POST /api/admin/create-key
 * Headers: { Authorization: "Bearer <ADMIN_SECRET>" }
 * Body: { key: string, tier?: string, label?: string }
 * Returns: { success: boolean, hash?: string, message?: string }
 */

import { createHash } from "crypto";
import { getRedis } from "../_redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { key, tier = "pro", label = "" } = req.body || {};
  if (!key || typeof key !== "string" || key.trim().length < 4) {
    return res.status(400).json({ success: false, message: "key must be at least 4 chars" });
  }

  const hash = createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
  const kvKey = `key:${hash}`;

  const redis = getRedis();
  const existing = await redis.get(kvKey);
  if (existing) {
    return res.status(409).json({ success: false, message: "Key already exists", hash });
  }

  await redis.set(kvKey, JSON.stringify({ tier, label, createdAt: new Date().toISOString(), uses: 0 }));

  return res.status(201).json({ success: true, hash, tier, label });
}
