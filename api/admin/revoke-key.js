/**
 * DELETE /api/admin/revoke-key
 * Headers: { Authorization: "Bearer <ADMIN_SECRET>" }
 * Body: { key: string }   ← the plaintext key to revoke
 * Returns: { success: boolean }
 */

import { createHash } from "crypto";
import { kv } from "@vercel/kv";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "DELETE") {
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

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { key } = body || {};
  if (!key) {
    return new Response(JSON.stringify({ success: false, message: "key is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const hash = createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
  await kv.del(`key:${hash}`);

  return new Response(JSON.stringify({ success: true, hash }), { status: 200, headers: corsHeaders });
}
