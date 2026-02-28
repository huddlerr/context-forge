import { describe, it, expect } from "vitest";
import { parseFlow } from "../parseFlow";

describe("parseFlow", () => {
  // --- Empty / null / undefined input ---
  it("returns empty array for empty string", () => {
    expect(parseFlow("")).toEqual([]);
  });

  it("returns empty array for null", () => {
    expect(parseFlow(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(parseFlow(undefined)).toEqual([]);
  });

  // --- Numbered steps with period ---
  it("parses numbered steps with periods", () => {
    const r = parseFlow("1. Open app  2. View list  3. Create item");
    expect(r).toHaveLength(3);
    expect(r[0].number).toBe(1);
    expect(r[0].text).toBe("Open app");
    expect(r[1].number).toBe(2);
    expect(r[1].text).toBe("View list");
    expect(r[2].number).toBe(3);
    expect(r[2].text).toBe("Create item");
  });

  // --- Arrow removal ---
  it("removes arrow symbols from steps", () => {
    const r = parseFlow("1. Open → trips list  2. Tap + → create");
    expect(r).toHaveLength(2);
    expect(r[0].text).not.toContain("→");
    expect(r[1].text).not.toContain("→");
  });

  it("removes -> arrow syntax from steps", () => {
    const r = parseFlow("1. Open -> trips list  2. Tap + -> create");
    expect(r).toHaveLength(2);
    expect(r[0].text).not.toContain("->");
    expect(r[1].text).not.toContain("->");
  });

  it("removes --> arrow syntax from steps", () => {
    const r = parseFlow("1. Open --> trips list  2. Tap + --> create");
    expect(r).toHaveLength(2);
    expect(r[0].text).not.toContain("-->");
    expect(r[1].text).not.toContain("-->");
  });

  // --- Step numbering ---
  it("assigns sequential numbers starting from 1", () => {
    const r = parseFlow("1. First  2. Second  3. Third");
    expect(r[0].number).toBe(1);
    expect(r[1].number).toBe(2);
    expect(r[2].number).toBe(3);
  });

  // --- Parenthesis numbered steps ---
  it("parses steps with closing parenthesis numbering", () => {
    const r = parseFlow("1) Open app  2) View list  3) Create item");
    expect(r).toHaveLength(3);
    expect(r[0].number).toBe(1);
    expect(r[0].text).toBe("Open app");
  });

  // --- Single step ---
  it("handles a single step", () => {
    const r = parseFlow("1. Open the app");
    expect(r).toHaveLength(1);
    expect(r[0].number).toBe(1);
    expect(r[0].text).toBe("Open the app");
  });

  // --- Text content preservation ---
  it("trims whitespace from step text", () => {
    const r = parseFlow("1.   Lots of spaces   2.  Also spaces  ");
    expect(r).toHaveLength(2);
    expect(r[0].text).toBe("Lots of spaces");
    expect(r[1].text).toBe("Also spaces");
  });

  // --- Complex flow ---
  it("parses a realistic user flow", () => {
    const r = parseFlow(
      "1. Open → trips list  2. Tap + → create  3. Share link → join"
    );
    expect(r).toHaveLength(3);
    expect(r[0].text).toContain("trips list");
    expect(r[1].text).toContain("create");
    expect(r[2].text).toContain("join");
  });
});
