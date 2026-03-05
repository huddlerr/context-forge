/**
 * POST /api/admin/create-key
 * Headers: { Authorization: "Bearer <ADMIN_SECRET>" }
 * Body: { key: string, tier?: string, label?: string }
 * Returns: { success: boolean, hash?: string, message?: string }
 *
 * Creates a new access key in Vercel KV.
 * Protected by ADMIN_SECRET environment variable.
 */

import { createHash } from "crypto";
import { kv } from "@vercel/kv";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Auth check
  const authHeader = req.headers.get("authorization") || "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { key, tier = "pro", label = "" } = body || {};
  if (!key || typeof key !== "string" || key.trim().length < 4) {
    return new Response(JSON.stringify({ success: false, message: "key must be at least 4 chars" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const hash = createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
  const kvKey = `key:${hash}`;

  // Check if already exists
  const existing = await kv.get(kvKey);
  if (existing) {
    return new Response(JSON.stringify({ success: false, message: "Key already exists", hash }), {
      status: 409,
      headers: corsHeaders,
    });
  }

  await kv.set(kvKey, {
    tier,
    label,
    createdAt: new Date().toISOString(),
    uses: 0,
  });

  return new Response(
    JSON.stringify({ success: true, hash, tier, label }),
    { status: 201, headers: corsHeaders }
  );
}
