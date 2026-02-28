import { describe, it, expect } from "vitest";
import { detectAuth } from "../detectAuth";

describe("detectAuth", () => {
  // --- Empty / null / undefined input ---
  it("returns empty array for empty string", () => {
    expect(detectAuth("")).toEqual([]);
  });

  it("returns empty array for null", () => {
    expect(detectAuth(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(detectAuth(undefined)).toEqual([]);
  });

  // --- Single provider detection ---
  it('detects "clerk" auth provider', () => {
    const r = detectAuth("clerk");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Clerk");
    expect(r[0].k).toContain("CLERK_PUBLISHABLE_KEY");
    expect(r[0].k).toContain("CLERK_SECRET_KEY");
  });

  it('detects "supabase" auth provider', () => {
    const r = detectAuth("supabase");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Supabase Auth");
    expect(r[0].k).toContain("SUPABASE_URL");
    expect(r[0].k).toContain("SUPABASE_ANON_KEY");
  });

  it('detects "firebase" auth provider', () => {
    const r = detectAuth("firebase");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Firebase Auth");
    expect(r[0].k).toContain("FIREBASE_API_KEY");
  });

  it('detects "google" OAuth provider', () => {
    const r = detectAuth("google");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Google OAuth");
    expect(r[0].k).toContain("GOOGLE_CLIENT_ID");
  });

  it('detects "oauth" as Google OAuth provider', () => {
    const r = detectAuth("oauth login");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Google OAuth");
  });

  it('detects "email" as Email/Password provider', () => {
    const r = detectAuth("email login");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Email/Password");
    expect(r[0].k).toEqual([]);
  });

  it('detects "password" as Email/Password provider', () => {
    const r = detectAuth("password auth");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Email/Password");
  });

  // --- Multiple providers ---
  it("detects multiple auth providers", () => {
    const r = detectAuth("clerk with google oauth and email/password");
    expect(r.length).toBeGreaterThanOrEqual(3);
    const providers = r.map((p) => p.p);
    expect(providers).toContain("Clerk");
    expect(providers).toContain("Google OAuth");
    expect(providers).toContain("Email/Password");
  });

  it("detects clerk + supabase together", () => {
    const r = detectAuth("using clerk for auth, supabase for db");
    const providers = r.map((p) => p.p);
    expect(providers).toContain("Clerk");
    expect(providers).toContain("Supabase Auth");
  });

  // --- Case insensitivity ---
  it("is case insensitive: CLERK", () => {
    const r = detectAuth("CLERK");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Clerk");
  });

  it("is case insensitive: Firebase", () => {
    const r = detectAuth("Firebase Auth");
    expect(r).toHaveLength(1);
    expect(r[0].p).toBe("Firebase Auth");
  });

  // --- Unrecognized input ---
  it("returns empty array for unrecognized input", () => {
    expect(detectAuth("some random text")).toEqual([]);
  });
});
