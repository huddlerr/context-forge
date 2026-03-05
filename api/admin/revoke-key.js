/**
 * DELETE /api/admin/revoke-key
 * Headers: { Authorization: "Bearer <ADMIN_SECRET>" }
 * Body: { key: string }
 * Returns: { success: boolean }
 */

import { createHash } from "crypto";
import { getRedis } from "../_redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "DELETE") return res.status(405).json({ success: false, message: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { key } = req.body || {};
  if (!key) return res.status(400).json({ success: false, message: "key is required" });

  const hash = createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
  const redis = getRedis();
  await redis.del(`key:${hash}`);

  return res.status(200).json({ success: true, hash });
}
