import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const inventories = pgTable(
  "inventories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("created_by_user_id").notNull(),
    name: text("name").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdIdx: index("inventories_user_id_idx").on(t.userId),
  }),
);

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

    // Authorization scope (required)
    createdByUserId: text("created_by_user_id").notNull(),

    // Inventory this asset belongs to
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => inventories.id),

    type: assetType("type").notNull(),
    name: text("name").notNull(),

    brand: text("brand"),
    model: text("model"),
    serialNumber: text("serial_number"),

    imageUrl: text("image_url"),

    status: assetStatus("status").notNull().default("IN_STOCK"),
    assignedToUserId: text("assigned_to_user_id"),

    // How many units of this asset
    quantity: integer("quantity").notNull().default(0),

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
    inventoryIdx: index("assets_inventory_id_idx").on(t.inventoryId),
  }),
);
