import { describe, expect, it } from "vitest";
import {
  ASSET_STATUS_OPTIONS,
  ASSET_TYPE_OPTIONS,
  labelize,
} from "@/lib/labelize";

describe("labelize()", () => {
  it("converts a single UPPER word to Title Case", () => {
    expect(labelize("LAPTOP")).toBe("Laptop");
  });

  it("converts SCREAMING_SNAKE_CASE to spaced Title Case", () => {
    expect(labelize("IN_STOCK")).toBe("In Stock");
  });

  it("handles three-word snake_case values", () => {
    expect(labelize("SOME_LONG_VALUE")).toBe("Some Long Value");
  });

  it("converts ASSIGNED correctly", () => {
    expect(labelize("ASSIGNED")).toBe("Assigned");
  });

  it("converts RETIRED correctly", () => {
    expect(labelize("RETIRED")).toBe("Retired");
  });

  it("converts all ASSET_TYPE_OPTIONS to human-readable labels", () => {
    const labels = ASSET_TYPE_OPTIONS.map(labelize);
    expect(labels).toEqual(["Laptop", "Monitor", "License", "Other"]);
  });

  it("converts all ASSET_STATUS_OPTIONS to human-readable labels", () => {
    const labels = ASSET_STATUS_OPTIONS.map(labelize);
    expect(labels).toEqual(["In Stock", "Assigned", "Retired"]);
  });

  it("ASSET_TYPE_OPTIONS contains exactly the four expected types", () => {
    expect(ASSET_TYPE_OPTIONS).toHaveLength(4);
    expect(ASSET_TYPE_OPTIONS).toContain("LAPTOP");
    expect(ASSET_TYPE_OPTIONS).toContain("MONITOR");
    expect(ASSET_TYPE_OPTIONS).toContain("LICENSE");
    expect(ASSET_TYPE_OPTIONS).toContain("OTHER");
  });

  it("ASSET_STATUS_OPTIONS contains exactly the three expected statuses", () => {
    expect(ASSET_STATUS_OPTIONS).toHaveLength(3);
    expect(ASSET_STATUS_OPTIONS).toContain("IN_STOCK");
    expect(ASSET_STATUS_OPTIONS).toContain("ASSIGNED");
    expect(ASSET_STATUS_OPTIONS).toContain("RETIRED");
  });
});
