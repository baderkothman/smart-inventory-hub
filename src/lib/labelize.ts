/**
 * Converts SCREAMING_SNAKE_CASE enum values to Title Case labels.
 * e.g. "IN_STOCK" → "In Stock", "LAPTOP" → "Laptop"
 */
export function labelize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

export const ASSET_TYPE_OPTIONS = [
  "LAPTOP",
  "MONITOR",
  "LICENSE",
  "OTHER",
] as const;

export const ASSET_STATUS_OPTIONS = [
  "IN_STOCK",
  "ASSIGNED",
  "RETIRED",
] as const;

export type AssetType = (typeof ASSET_TYPE_OPTIONS)[number];
export type AssetStatus = (typeof ASSET_STATUS_OPTIONS)[number];
