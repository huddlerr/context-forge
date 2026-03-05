/**
 * POST /api/validate-key
 * Body: { key: string }
 * Returns: { valid: boolean, tier?: string, message?: string }
 *
 * Validates an access key against Vercel KV.
 * Keys are stored as: key:<sha256(key)> → JSON { tier, createdAt, label?, uses }
 * Uses Web Crypto API (Edge-compatible, no Node crypto module needed).
 */

import { kv } from "@vercel/kv";

export const config = { runtime: "edge" };

async function sha256hex(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "https://context-forge-eta.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173",
  ];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ valid: false, message: "Method not allowed" }), {
      status: 405, headers: corsHeaders,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ valid: false, message: "Invalid JSON" }), {
      status: 400, headers: corsHeaders,
    });
  }

  const { key } = body || {};
  if (!key || typeof key !== "string" || key.trim().length < 4) {
    return new Response(JSON.stringify({ valid: false, message: "Key is required" }), {
      status: 400, headers: corsHeaders,
    });
  }

  const hash = await sha256hex(key.trim().toLowerCase());
  const kvKey = `key:${hash}`;

  let record;
  try {
    record = await kv.get(kvKey);
  } catch (err) {
    console.error("KV error:", err);
    return new Response(JSON.stringify({ valid: false, message: "Service unavailable" }), {
      status: 503, headers: corsHeaders,
    });
  }

  if (!record) {
    return new Response(JSON.stringify({ valid: false, message: "Invalid key" }), {
      status: 200, headers: corsHeaders,
    });
  }

  // Increment usage counter (fire-and-forget)
  kv.set(kvKey, { ...record, uses: (record.uses || 0) + 1, lastUsed: new Date().toISOString() }).catch(() => {});

  return new Response(
    JSON.stringify({ valid: true, tier: record.tier || "pro", label: record.label || null }),
    { status: 200, headers: corsHeaders }
  );
}
