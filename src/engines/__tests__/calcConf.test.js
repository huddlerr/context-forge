import { describe, it, expect } from "vitest";
import { calcConf } from "../calcConf";
import { QS } from "../../data/questions";

describe("calcConf", () => {
  const questionCount = QS.length; // 10 questions

  // --- All empty answers ---
  it("returns overall near 0 when all answers are empty", () => {
    const r = calcConf(Array(10).fill(""));
    expect(r.overall).toBe(0);
  });

  it("reports 10 issues when all answers are empty", () => {
    const r = calcConf(Array(10).fill(""));
    expect(r.issues).toHaveLength(questionCount);
  });

  it("all individual scores are 0 when all answers are empty", () => {
    const r = calcConf(Array(10).fill(""));
    Object.values(r.individual).forEach((score) => {
      expect(score).toBe(0);
    });
  });

  it("issues contain 'Empty' message for empty answers", () => {
    const r = calcConf(Array(10).fill(""));
    r.issues.forEach((issue) => {
      expect(issue.m).toContain("Empty");
    });
  });

  // --- All filled with long text ---
  it("returns overall near 1 when all answers are long", () => {
    const longText = "A".repeat(200);
    const r = calcConf(Array(10).fill(longText));
    expect(r.overall).toBeGreaterThan(0.8);
    expect(r.overall).toBeLessThanOrEqual(1);
  });

  it("has no issues when all answers are long", () => {
    const longText = "A".repeat(200);
    const r = calcConf(Array(10).fill(longText));
    expect(r.issues).toHaveLength(0);
  });

  it("all individual scores are high when answers are long", () => {
    const longText = "A".repeat(200);
    const r = calcConf(Array(10).fill(longText));
    Object.values(r.individual).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0.85);
    });
  });

  // --- Partial fill ---
  it("returns proportional scores for partial answers", () => {
    const answers = Array(10).fill("");
    answers[0] = "A".repeat(200); // Q1 filled
    answers[1] = "A".repeat(200); // Q2 filled
    const r = calcConf(answers);
    expect(r.overall).toBeGreaterThan(0);
    expect(r.overall).toBeLessThan(1);
  });

  it("reports fewer issues when some answers are filled", () => {
    const answers = Array(10).fill("");
    answers[0] = "A".repeat(200);
    answers[1] = "A".repeat(200);
    const r = calcConf(answers);
    expect(r.issues.length).toBeLessThan(questionCount);
    expect(r.issues.length).toBeGreaterThan(0);
  });

  // --- Score tiers ---
  it("gives score 0.3 for very brief answers (< 20 chars)", () => {
    const answers = Array(10).fill("");
    answers[0] = "short"; // 5 chars, no stack detection
    const r = calcConf(answers);
    expect(r.individual[1]).toBe(0.3);
  });

  it("gives score 0.6 for medium answers (20-59 chars)", () => {
    const answers = Array(10).fill("");
    answers[0] = "A".repeat(30); // 30 chars
    const r = calcConf(answers);
    expect(r.individual[1]).toBe(0.6);
  });

  it("gives score 0.85 for longer answers (60-149 chars)", () => {
    const answers = Array(10).fill("");
    answers[0] = "A".repeat(100); // 100 chars
    const r = calcConf(answers);
    expect(r.individual[1]).toBe(0.85);
  });

  it("gives score 0.95 for very long answers (150+ chars)", () => {
    const answers = Array(10).fill("");
    answers[0] = "A".repeat(200); // 200 chars
    const r = calcConf(answers);
    expect(r.individual[1]).toBe(0.95);
  });

  // --- Brief answer issues ---
  it('reports "Very brief" issue for short but non-empty answers', () => {
    const answers = Array(10).fill("");
    answers[0] = "hi"; // very short
    const r = calcConf(answers);
    const q1Issue = r.issues.find((i) => i.q === 1);
    expect(q1Issue).toBeDefined();
    expect(q1Issue.m).toBe("Very brief");
  });

  // --- Smart detection bonuses ---
  it("gives bonus score for Q3 (stack) when tech is detected", () => {
    const answers = Array(10).fill("");
    // 25 chars to get base 0.6 (20-59 range), then +0.1 for detected stack = 0.7
    answers[2] = "expo " + "A".repeat(20);
    const r = calcConf(answers);
    expect(r.individual[3]).toBe(0.7);
  });

  it("gives bonus score for Q4 (data) when entities are detected", () => {
    const answers = Array(10).fill("");
    // 60+ chars with valid data model
    answers[3] = "Trips (name, destination, date_range, owner_id, something)";
    const r = calcConf(answers);
    // base 0.6 (20-59 chars) + 0.1 for detected entities
    expect(r.individual[4]).toBeGreaterThanOrEqual(0.7);
  });

  it("gives bonus score for Q7 (auth) when auth is detected", () => {
    const answers = Array(10).fill("");
    answers[6] = "clerk authentication setup here something more"; // 46 chars = 0.6 base
    const r = calcConf(answers);
    expect(r.individual[7]).toBe(0.7);
  });

  it("gives bonus score for Q8 (integrations) when integrations are detected", () => {
    const answers = Array(10).fill("");
    answers[7] = "stripe payment integration here more text to fill"; // 50 chars = 0.6 base
    const r = calcConf(answers);
    expect(r.individual[8]).toBe(0.7);
  });

  // --- Return structure ---
  it("returns object with individual, overall, and issues", () => {
    const r = calcConf([]);
    expect(r).toHaveProperty("individual");
    expect(r).toHaveProperty("overall");
    expect(r).toHaveProperty("issues");
    expect(typeof r.overall).toBe("number");
    expect(Array.isArray(r.issues)).toBe(true);
    expect(typeof r.individual).toBe("object");
  });

  it("individual has scores for all question IDs", () => {
    const r = calcConf([]);
    QS.forEach((q) => {
      expect(r.individual).toHaveProperty(String(q.id));
    });
  });

  // --- Scores capped at 1 ---
  it("individual scores never exceed 1", () => {
    const longTextWithKeywords =
      "expo convex clerk stripe gemini Trips (name, dest) " + "A".repeat(200);
    const answers = Array(10).fill(longTextWithKeywords);
    const r = calcConf(answers);
    Object.values(r.individual).forEach((score) => {
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  // --- Handles undefined/missing answers ---
  it("handles completely missing answers array gracefully", () => {
    const r = calcConf([]);
    expect(r.overall).toBe(0);
    expect(r.issues).toHaveLength(questionCount);
  });
});
