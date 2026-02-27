/**
 * Unit tests for the quantity-clamping logic used in the POST /api/assets route.
 * The rule: quantity must be a non-negative integer.
 *   typeof data.quantity === "number" ? Math.max(0, Math.floor(data.quantity)) : 0
 */
import { describe, expect, it } from "vitest";

function clampQuantity(value: unknown): number {
  return typeof value === "number" ? Math.max(0, Math.floor(value)) : 0;
}

describe("clampQuantity()", () => {
  it("returns 0 for undefined input", () => {
    expect(clampQuantity(undefined)).toBe(0);
  });

  it("returns 0 for string input", () => {
    expect(clampQuantity("5")).toBe(0);
  });

  it("returns 0 for null", () => {
    expect(clampQuantity(null)).toBe(0);
  });

  it("returns the integer as-is for a positive whole number", () => {
    expect(clampQuantity(10)).toBe(10);
  });

  it("floors a positive float", () => {
    expect(clampQuantity(4.9)).toBe(4);
  });

  it("clamps a negative number to 0", () => {
    expect(clampQuantity(-3)).toBe(0);
  });

  it("clamps a negative float to 0", () => {
    expect(clampQuantity(-0.5)).toBe(0);
  });

  it("returns 0 for 0", () => {
    expect(clampQuantity(0)).toBe(0);
  });

  it("handles very large numbers", () => {
    expect(clampQuantity(9999)).toBe(9999);
  });
});
