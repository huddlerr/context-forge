/**
 * Shared Redis client for all API functions.
 * Uses ioredis with the REDIS_URL environment variable.
 * The leading underscore (_redis.js) prevents Vercel from treating
 * this file as a serverless function endpoint.
 */

import Redis from "ioredis";

let client;

export function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL environment variable is not set");
    client = new Redis(url, {
      // Retry 3 times with 200ms delay before giving up
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times <= 3 ? 200 : null),
      // TLS required for rediss:// URLs (Redis Cloud uses rediss://)
      tls: url.startsWith("rediss://") ? {} : undefined,
    });
  }
  return client;
}
