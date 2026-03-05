/**
 * GET /api/admin/list-keys
 * Headers: { Authorization: "Bearer <ADMIN_SECRET>" }
 * Returns: { keys: Array<{ hash, tier, label, createdAt, uses, lastUsed }> }
 */

import { getRedis } from "../_redis.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const redis = getRedis();

  // Scan all key:* entries
  const allKeys = [];
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "key:*", "COUNT", 100);
    allKeys.push(...keys);
    cursor = nextCursor;
  } while (cursor !== "0");

  const records = await Promise.all(
    allKeys.map(async (k) => {
      const raw = await redis.get(k);
      const record = raw ? JSON.parse(raw) : {};
      return { hash: k.replace("key:", ""), ...record };
    })
  );

  return res.status(200).json({ keys: records });
}
