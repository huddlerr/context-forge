/**
 * GET /api/admin/list-keys
 * Headers: { Authorization: "Bearer <ADMIN_SECRET>" }
 * Returns: { keys: Array<{ hash, tier, label, createdAt, uses, lastUsed }> }
 *
 * Lists all access keys (hashes only, never plaintext).
 */

import { kv } from "@vercel/kv";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("authorization") || "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Scan all key:* entries
  let cursor = 0;
  const allKeys = [];
  do {
    const [nextCursor, keys] = await kv.scan(cursor, { match: "key:*", count: 100 });
    allKeys.push(...keys);
    cursor = nextCursor;
  } while (cursor !== 0);

  const records = await Promise.all(
    allKeys.map(async (k) => {
      const record = await kv.get(k);
      return { hash: k.replace("key:", ""), ...record };
    })
  );

  return new Response(JSON.stringify({ keys: records }), { status: 200, headers: corsHeaders });
}
