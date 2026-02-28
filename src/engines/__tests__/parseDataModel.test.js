import { describe, it, expect } from "vitest";
import { parseDataModel } from "../parseDataModel";

describe("parseDataModel", () => {
  // --- Empty / null / undefined input ---
  it("returns empty array for empty string", () => {
    expect(parseDataModel("")).toEqual([]);
  });

  it("returns empty array for null", () => {
    expect(parseDataModel(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(parseDataModel(undefined)).toEqual([]);
  });

  // --- Single entity ---
  it("parses a single entity with parentheses", () => {
    const r = parseDataModel("Trips (name, destination, date_range)");
    expect(r).toHaveLength(1);
    expect(r[0].name).toBe("Trips");
    expect(r[0].fields).toHaveLength(3);
    expect(r[0].fields[0].name).toBe("name");
    expect(r[0].fields[1].name).toBe("destination");
    expect(r[0].fields[2].name).toBe("date_range");
  });

  it("defaults field type to 'string' when not specified", () => {
    const r = parseDataModel("Users (name, email)");
    expect(r[0].fields[0].type).toBe("string");
    expect(r[0].fields[1].type).toBe("string");
  });

  it("uses explicit field type when provided", () => {
    const r = parseDataModel("Users (age number, name)");
    expect(r[0].fields[0].name).toBe("age");
    expect(r[0].fields[0].type).toBe("number");
    expect(r[0].fields[1].type).toBe("string");
  });

  // --- Multiple entities ---
  it("parses multiple entities separated by periods", () => {
    const r = parseDataModel(
      "Trips (name, destination, date_range). Members (user_id, trip_id, role)"
    );
    expect(r).toHaveLength(2);
    expect(r[0].name).toBe("Trips");
    expect(r[1].name).toBe("Members");
  });

  it("parses multiple entities with correct field counts", () => {
    const r = parseDataModel(
      "Trips (name, destination). Members (user_id, trip_id, role). Votes (member_id, venue_id)"
    );
    expect(r).toHaveLength(3);
    expect(r[0].fields).toHaveLength(2);
    expect(r[1].fields).toHaveLength(3);
    expect(r[2].fields).toHaveLength(2);
  });

  // --- Colon syntax ---
  it("parses entities with colon syntax", () => {
    const r = parseDataModel("Users: name, email, age");
    expect(r).toHaveLength(1);
    expect(r[0].name).toBe("Users");
    expect(r[0].fields.length).toBeGreaterThanOrEqual(2);
  });

  // --- No match ---
  it("returns empty array for text with no entity pattern", () => {
    const r = parseDataModel("just some random text with no entities");
    expect(r).toEqual([]);
  });

  // --- Field type inference ---
  it("respects explicit types after field names", () => {
    const r = parseDataModel("Products (price number, active boolean, title)");
    expect(r[0].fields[0].name).toBe("price");
    expect(r[0].fields[0].type).toBe("number");
    expect(r[0].fields[1].name).toBe("active");
    expect(r[0].fields[1].type).toBe("boolean");
    expect(r[0].fields[2].name).toBe("title");
    expect(r[0].fields[2].type).toBe("string");
  });

  // --- Edge cases ---
  it("handles entity with single field", () => {
    const r = parseDataModel("Tags (name)");
    expect(r).toHaveLength(1);
    expect(r[0].fields).toHaveLength(1);
    expect(r[0].fields[0].name).toBe("name");
  });

  it("handles whitespace in entity names", () => {
    const r = parseDataModel("Trip Members (user_id, trip_id)");
    expect(r).toHaveLength(1);
    // The entity name should include the multi-word name
    expect(r[0].name).toBeTruthy();
    expect(r[0].fields).toHaveLength(2);
  });
});
