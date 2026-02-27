import { describe, expect, it } from "vitest";
import {
  buildPieSlices,
  type InventoryStat,
} from "@/app/(app)/home/analytics-charts";

const makeInv = (
  overrides: Partial<InventoryStat> & { assetCount: number },
): InventoryStat => ({
  id: "id-1",
  name: "Warehouse",
  isDefault: false,
  ...overrides,
});

describe("buildPieSlices()", () => {
  it("returns an empty array for empty input", () => {
    expect(buildPieSlices([])).toEqual([]);
  });

  it("returns an empty array when every assetCount is 0", () => {
    const data = [makeInv({ assetCount: 0 }), makeInv({ id: "id-2", assetCount: 0 })];
    expect(buildPieSlices(data)).toEqual([]);
  });

  it("returns one slice for a single inventory with items", () => {
    const slices = buildPieSlices([makeInv({ assetCount: 10 })]);
    expect(slices).toHaveLength(1);
    expect(slices[0].percent).toBe(100);
  });

  it("calculates correct percentage for a 50/50 split", () => {
    const data = [
      makeInv({ id: "a", assetCount: 5 }),
      makeInv({ id: "b", assetCount: 5 }),
    ];
    const slices = buildPieSlices(data);
    expect(slices[0].percent).toBe(50);
    expect(slices[1].percent).toBe(50);
  });

  it("calculates correct percentages for 25/25/50 distribution", () => {
    const data = [
      makeInv({ id: "a", assetCount: 1 }),
      makeInv({ id: "b", assetCount: 1 }),
      makeInv({ id: "c", assetCount: 2 }),
    ];
    const slices = buildPieSlices(data);
    expect(slices[0].percent).toBe(25);
    expect(slices[1].percent).toBe(25);
    expect(slices[2].percent).toBe(50);
  });

  it("assigns the first SLICE_COLOR (#7C3AED) to the first slice", () => {
    const slices = buildPieSlices([makeInv({ assetCount: 5 })]);
    expect(slices[0].color).toBe("#7C3AED");
  });

  it("cycles through colors for many inventories", () => {
    const data = Array.from({ length: 9 }, (_, i) =>
      makeInv({ id: `inv-${i}`, assetCount: 1 }),
    );
    const slices = buildPieSlices(data);
    // Index 8 should wrap around and reuse index 0's color (#7C3AED)
    expect(slices[8].color).toBe(slices[0].color);
  });

  it("preserves id, name, and isDefault from source data", () => {
    const inv: InventoryStat = {
      id: "abc-123",
      name: "Remote Office",
      isDefault: true,
      assetCount: 7,
    };
    const [slice] = buildPieSlices([inv]);
    expect(slice.id).toBe("abc-123");
    expect(slice.name).toBe("Remote Office");
    expect(slice.isDefault).toBe(true);
  });

  it("generates a non-empty SVG path string for each slice", () => {
    const slices = buildPieSlices([
      makeInv({ id: "a", assetCount: 3 }),
      makeInv({ id: "b", assetCount: 7 }),
    ]);
    for (const slice of slices) {
      expect(typeof slice.path).toBe("string");
      expect(slice.path.length).toBeGreaterThan(0);
    }
  });
});
