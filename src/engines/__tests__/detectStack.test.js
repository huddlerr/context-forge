import { describe, it, expect } from "vitest";
import { detectStack } from "../detectStack";

describe("detectStack", () => {
  // --- Empty / null / undefined input ---
  it("returns empty results for empty string", () => {
    const r = detectStack("");
    expect(r.detected).toEqual({});
    expect(r.deps).toEqual({});
    expect(r.devDeps).toEqual({});
    expect(r.types).toEqual([]);
  });

  it("returns empty results for null", () => {
    const r = detectStack(null);
    expect(r.detected).toEqual({});
    expect(r.deps).toEqual({});
    expect(r.devDeps).toEqual({});
    expect(r.types).toEqual([]);
  });

  it("returns empty results for undefined", () => {
    const r = detectStack(undefined);
    expect(r.detected).toEqual({});
    expect(r.deps).toEqual({});
    expect(r.devDeps).toEqual({});
    expect(r.types).toEqual([]);
  });

  // --- Single keyword detection ---
  it('detects "expo" and returns mobile type', () => {
    const r = detectStack("expo");
    expect(r.detected).toHaveProperty("expo");
    expect(r.deps).toHaveProperty("expo");
    expect(r.deps).toHaveProperty("expo-router");
    expect(r.devDeps).toHaveProperty("@babel/core");
    expect(r.types).toContain("mobile");
  });

  it('detects "next" and returns web type', () => {
    const r = detectStack("next");
    expect(r.detected).toHaveProperty("next");
    expect(r.deps).toHaveProperty("next");
    expect(r.devDeps).toHaveProperty("typescript");
    expect(r.types).toContain("web");
  });

  it('detects "convex" and returns backend type', () => {
    const r = detectStack("convex");
    expect(r.detected).toHaveProperty("convex");
    expect(r.deps).toHaveProperty("convex");
    expect(r.types).toContain("backend");
  });

  it('detects "zustand" and returns state type', () => {
    const r = detectStack("zustand");
    expect(r.detected).toHaveProperty("zustand");
    expect(r.deps).toHaveProperty("zustand");
    expect(r.types).toContain("state");
  });

  it('detects "clerk" and returns auth type', () => {
    const r = detectStack("clerk");
    expect(r.detected).toHaveProperty("clerk");
    expect(r.deps).toHaveProperty("@clerk/clerk-expo");
    expect(r.types).toContain("auth");
  });

  it('detects "nativewind" and returns styling type', () => {
    const r = detectStack("nativewind");
    expect(r.detected).toHaveProperty("nativewind");
    expect(r.deps).toHaveProperty("nativewind");
    expect(r.devDeps).toHaveProperty("tailwindcss");
    expect(r.types).toContain("styling");
  });

  it('detects "stripe" and returns payments type', () => {
    const r = detectStack("stripe");
    expect(r.detected).toHaveProperty("stripe");
    expect(r.deps).toHaveProperty("stripe");
    expect(r.types).toContain("payments");
  });

  it('detects "typescript" and returns lang type', () => {
    const r = detectStack("typescript");
    expect(r.detected).toHaveProperty("typescript");
    expect(r.devDeps).toHaveProperty("typescript");
    expect(r.types).toContain("lang");
  });

  it('detects "gemini" and returns ai type', () => {
    const r = detectStack("gemini");
    expect(r.detected).toHaveProperty("gemini");
    expect(r.deps).toHaveProperty("@google/generative-ai");
    expect(r.types).toContain("ai");
  });

  it('detects "drizzle" and returns orm type', () => {
    const r = detectStack("drizzle");
    expect(r.detected).toHaveProperty("drizzle");
    expect(r.deps).toHaveProperty("drizzle-orm");
    expect(r.devDeps).toHaveProperty("drizzle-kit");
    expect(r.types).toContain("orm");
  });

  // --- Multiple keyword detection ---
  it("detects multiple technologies and merges deps", () => {
    const r = detectStack("expo zustand nativewind");
    expect(r.detected).toHaveProperty("expo");
    expect(r.detected).toHaveProperty("zustand");
    expect(r.detected).toHaveProperty("nativewind");
    expect(r.deps).toHaveProperty("expo");
    expect(r.deps).toHaveProperty("zustand");
    expect(r.deps).toHaveProperty("nativewind");
    expect(r.types).toContain("mobile");
    expect(r.types).toContain("state");
    expect(r.types).toContain("styling");
  });

  it("merges devDeps from multiple patterns", () => {
    const r = detectStack("expo nativewind typescript");
    expect(r.devDeps).toHaveProperty("@babel/core");
    expect(r.devDeps).toHaveProperty("tailwindcss");
    expect(r.devDeps).toHaveProperty("typescript");
  });

  // --- Case insensitivity ---
  it("is case insensitive: EXPO should detect expo", () => {
    const r = detectStack("EXPO");
    expect(r.detected).toHaveProperty("expo");
    expect(r.types).toContain("mobile");
  });

  it("is case insensitive: Zustand should detect zustand", () => {
    const r = detectStack("Zustand");
    expect(r.detected).toHaveProperty("zustand");
  });

  it("is case insensitive: NEXT.JS context", () => {
    const r = detectStack("Using NEXT for my project");
    expect(r.detected).toHaveProperty("next");
    expect(r.types).toContain("web");
  });

  // --- Text within a sentence ---
  it("detects keywords embedded in a sentence", () => {
    const r = detectStack("I want to use expo with convex and clerk");
    expect(r.detected).toHaveProperty("expo");
    expect(r.detected).toHaveProperty("convex");
    expect(r.detected).toHaveProperty("clerk");
    expect(r.types).toContain("mobile");
    expect(r.types).toContain("backend");
    expect(r.types).toContain("auth");
  });

  // --- Unrecognized input ---
  it("returns empty for unrecognized text", () => {
    const r = detectStack("some random text that has no tech keywords");
    expect(r.detected).toEqual({});
    expect(r.deps).toEqual({});
    expect(r.devDeps).toEqual({});
    expect(r.types).toEqual([]);
  });

  // --- Types are unique ---
  it("does not duplicate types when multiple patterns share a type", () => {
    const r = detectStack("expo react native");
    // Both "expo" and "react native" have type "mobile"
    const mobileCount = r.types.filter((t) => t === "mobile").length;
    expect(mobileCount).toBe(1);
  });
});
