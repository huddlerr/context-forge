import { describe, it, expect } from "vitest";
import { detectIntegrations } from "../detectIntegrations";

describe("detectIntegrations", () => {
  // --- Empty / null / undefined input ---
  it("returns empty array for empty string", () => {
    expect(detectIntegrations("")).toEqual([]);
  });

  it("returns empty array for null", () => {
    expect(detectIntegrations(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(detectIntegrations(undefined)).toEqual([]);
  });

  // --- Single integration detection ---
  it('detects "gemini" as Google Gemini', () => {
    const r = detectIntegrations("gemini");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Google Gemini");
    expect(r[0].k).toContain("GEMINI_API_KEY");
  });

  it('detects "openai" as OpenAI', () => {
    const r = detectIntegrations("openai");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("OpenAI");
    expect(r[0].k).toContain("OPENAI_API_KEY");
  });

  it('detects "gpt" as OpenAI', () => {
    const r = detectIntegrations("gpt");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("OpenAI");
    expect(r[0].k).toContain("OPENAI_API_KEY");
  });

  it('detects "stripe" with both keys', () => {
    const r = detectIntegrations("stripe");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Stripe");
    expect(r[0].k).toContain("STRIPE_SECRET_KEY");
    expect(r[0].k).toContain("STRIPE_PUBLISHABLE_KEY");
  });

  it('detects "sentry" with DSN key', () => {
    const r = detectIntegrations("sentry");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Sentry");
    expect(r[0].k).toContain("SENTRY_DSN");
  });

  it('detects "foursquare"', () => {
    const r = detectIntegrations("foursquare");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Foursquare");
    expect(r[0].k).toContain("FOURSQUARE_API_KEY");
  });

  it('detects "resend"', () => {
    const r = detectIntegrations("resend");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Resend");
    expect(r[0].k).toContain("RESEND_API_KEY");
  });

  // --- Multiple integrations ---
  it("detects multiple integrations at once", () => {
    const r = detectIntegrations("gemini stripe sentry");
    expect(r.length).toBe(3);
    const names = r.map((i) => i.n);
    expect(names).toContain("Google Gemini");
    expect(names).toContain("Stripe");
    expect(names).toContain("Sentry");
  });

  it("detects gpt and stripe together", () => {
    const r = detectIntegrations("Using GPT-4 with Stripe for payments");
    const names = r.map((i) => i.n);
    expect(names).toContain("OpenAI");
    expect(names).toContain("Stripe");
  });

  // --- Case insensitivity ---
  it("is case insensitive: GEMINI", () => {
    const r = detectIntegrations("GEMINI");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Google Gemini");
  });

  it("is case insensitive: Stripe", () => {
    const r = detectIntegrations("Stripe payments");
    expect(r).toHaveLength(1);
    expect(r[0].n).toBe("Stripe");
  });

  // --- Unrecognized input ---
  it("returns empty array for unrecognized input", () => {
    expect(detectIntegrations("nothing here to detect")).toEqual([]);
  });

  // --- Both openai and gpt trigger same result ---
  it('both "openai" and "gpt" in same text still produce one OpenAI entry', () => {
    // The function checks both conditions with ||, but only pushes once
    const r = detectIntegrations("openai gpt");
    // Since the || short-circuits, it should only push once
    expect(r.filter((i) => i.n === "OpenAI")).toHaveLength(1);
  });
});
