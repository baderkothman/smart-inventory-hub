import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";

export const assetType = pgEnum("asset_type", [
  "LAPTOP",
  "MONITOR",
  "LICENSE",
  "OTHER",
]);
export const assetStatus = pgEnum("asset_status", [
  "IN_STOCK",
  "ASSIGNED",
  "RETIRED",
]);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // ✅ ownership / authorization scope
    createdByUserId: text("created_by_user_id").notNull(),
    // optional if you use Clerk Organizations later:
    // orgId: text("org_id"),

    type: assetType("type").notNull(),
    name: text("name").notNull(),
    brand: text("brand"),
    model: text("model"),
    serialNumber: text("serial_number"),

    status: assetStatus("status").notNull().default("IN_STOCK"),
    assignedToUserId: text("assigned_to_user_id"),

    purchaseDate: date("purchase_date"),
    warrantyEndDate: date("warranty_end_date"),

    description: text("description"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    createdByIdx: index("assets_created_by_idx").on(t.createdByUserId),
    // orgIdx: index("assets_org_idx").on(t.orgId),
  }),
);
