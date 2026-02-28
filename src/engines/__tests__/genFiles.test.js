import { describe, it, expect } from "vitest";
import { genFiles } from "../genFiles";

const EXPECTED_FILE_KEYS = [
  "soul.md",
  "design.md",
  "claude.md",
  "package.json",
  "tsconfig.json",
  ".env.example",
  "types.ts",
  "README.md",
  "TASKS.md",
  ".cursorrules",
];

describe("genFiles", () => {
  // --- Returns all 10 file keys ---
  it("returns all 10 expected file keys with empty answers", () => {
    const result = genFiles([]);
    const keys = Object.keys(result);
    EXPECTED_FILE_KEYS.forEach((key) => {
      expect(keys).toContain(key);
    });
    expect(keys).toHaveLength(10);
  });

  it("returns all 10 expected file keys with undefined answers", () => {
    const result = genFiles(Array(10).fill(undefined));
    const keys = Object.keys(result);
    EXPECTED_FILE_KEYS.forEach((key) => {
      expect(keys).toContain(key);
    });
  });

  // --- Empty answers produce placeholder text ---
  it("uses placeholder text when answers are empty", () => {
    const result = genFiles([]);
    expect(result["soul.md"]).toContain("[Q1]");
    expect(result["soul.md"]).toContain("[Q2]");
    expect(result["claude.md"]).toContain("[Q1]");
    expect(result["design.md"]).toContain("[Q2]");
  });

  // --- Files contain answer content ---
  it("includes answer content in generated files", () => {
    const answers = [
      "Travel group logistics app",    // Q1 - Soul
      "Youth soccer families",          // Q2 - User
      "expo convex nativewind",         // Q3 - Stack
      "Trips (name, destination)",      // Q4 - Data
      "1. Open → trips list  2. Tap + → create", // Q5 - Flow
      "Energetic blue theme",           // Q6 - Vibe
      "clerk email",                    // Q7 - Auth
      "gemini stripe",                  // Q8 - APIs
      "NativeWind only, offline",       // Q9 - Rules
      "Create/join trips, TestFlight",  // Q10 - Done
    ];
    const result = genFiles(answers);

    // soul.md should contain Q1 and Q2
    expect(result["soul.md"]).toContain("Travel group logistics app");
    expect(result["soul.md"]).toContain("Youth soccer families");

    // design.md should contain Q2 and Q6
    expect(result["design.md"]).toContain("Youth soccer families");
    expect(result["design.md"]).toContain("Energetic blue theme");

    // claude.md should contain Q1 and detected stack info
    expect(result["claude.md"]).toContain("Travel group logistics app");
    expect(result["claude.md"]).toContain("expo convex nativewind");

    // package.json should be valid JSON with detected deps
    const pkg = JSON.parse(result["package.json"]);
    expect(pkg.dependencies).toHaveProperty("expo");
    expect(pkg.dependencies).toHaveProperty("convex");

    // .env.example should have auth and integration keys
    expect(result[".env.example"]).toContain("CLERK_PUBLISHABLE_KEY");
    expect(result[".env.example"]).toContain("GEMINI_API_KEY");
    expect(result[".env.example"]).toContain("STRIPE_SECRET_KEY");

    // types.ts should have the Trips interface
    expect(result["types.ts"]).toContain("Trips");
    expect(result["types.ts"]).toContain("name");
    expect(result["types.ts"]).toContain("destination");

    // README.md should contain Q1 and Q10
    expect(result["README.md"]).toContain("Travel group logistics app");
    expect(result["README.md"]).toContain("Create/join trips, TestFlight");

    // TASKS.md should contain flow steps and integrations
    expect(result["TASKS.md"]).toContain("trips list");
    expect(result["TASKS.md"]).toContain("Google Gemini");
    expect(result["TASKS.md"]).toContain("Stripe");

    // .cursorrules should contain Q9 and Q3
    expect(result[".cursorrules"]).toContain("NativeWind only, offline");
    expect(result[".cursorrules"]).toContain("expo convex nativewind");
  });

  // --- All files are strings ---
  it("all generated files are strings", () => {
    const result = genFiles([]);
    Object.values(result).forEach((content) => {
      expect(typeof content).toBe("string");
    });
  });

  // --- package.json is valid JSON ---
  it("package.json is valid JSON", () => {
    const result = genFiles(["My App", "", "next typescript", "", "", "", "", "", "", ""]);
    expect(() => JSON.parse(result["package.json"])).not.toThrow();
  });

  // --- tsconfig.json is valid JSON ---
  it("tsconfig.json is valid JSON", () => {
    const result = genFiles([]);
    expect(() => JSON.parse(result["tsconfig.json"])).not.toThrow();
  });

  // --- Slug generation ---
  it("generates a slug for the package name from Q1", () => {
    const result = genFiles(["My Amazing Travel App", "", "", "", "", "", "", "", "", ""]);
    const pkg = JSON.parse(result["package.json"]);
    expect(pkg.name).toBe("my-amazing-travel-app");
  });

  it("uses 'myapp' as default slug when Q1 is empty", () => {
    // The slug logic strips non-alphanumeric/non-space chars, so "my-app" becomes "myapp"
    const result = genFiles([]);
    const pkg = JSON.parse(result["package.json"]);
    expect(pkg.name).toBe("myapp");
  });

  // --- Mobile vs web scripts ---
  it("generates mobile scripts when expo is in stack", () => {
    const result = genFiles(["App", "", "expo", "", "", "", "", "", "", ""]);
    const pkg = JSON.parse(result["package.json"]);
    expect(pkg.scripts).toHaveProperty("start");
    expect(pkg.scripts.start).toContain("expo");
  });

  it("generates web scripts when next is in stack", () => {
    const result = genFiles(["App", "", "next", "", "", "", "", "", "", ""]);
    const pkg = JSON.parse(result["package.json"]);
    expect(pkg.scripts).toHaveProperty("dev");
    expect(pkg.scripts).toHaveProperty("build");
  });

  // --- Convex detection adds env var ---
  it("adds CONVEX_DEPLOYMENT to .env.example when convex is detected", () => {
    const result = genFiles(["App", "", "expo convex", "", "", "", "", "", "", ""]);
    expect(result[".env.example"]).toContain("CONVEX_DEPLOYMENT");
  });

  // --- Data model generates types ---
  it("generates TypeScript interfaces from data model", () => {
    const result = genFiles(["App", "", "", "Users (name, email, created_at)", "", "", "", "", "", ""]);
    expect(result["types.ts"]).toContain("export interface Users");
    expect(result["types.ts"]).toContain("name: string");
    expect(result["types.ts"]).toContain("email: string");
    expect(result["types.ts"]).toContain("created_at: Date");
  });

  // --- No data model gives placeholder ---
  it("gives placeholder comment in types.ts when no data model", () => {
    const result = genFiles([]);
    expect(result["types.ts"]).toContain("Describe data in Q4 to auto-generate");
  });

  // --- Auth detection in claude.md ---
  it("includes detected auth providers in claude.md", () => {
    const result = genFiles(["App", "", "", "", "", "", "clerk google", "", "", ""]);
    expect(result["claude.md"]).toContain("Clerk");
    expect(result["claude.md"]).toContain("Google OAuth");
  });

  // --- Integration detection in claude.md ---
  it("includes detected integrations in claude.md", () => {
    const result = genFiles(["App", "", "", "", "", "", "", "stripe openai", "", ""]);
    expect(result["claude.md"]).toContain("Stripe");
    expect(result["claude.md"]).toContain("OpenAI");
  });
});
