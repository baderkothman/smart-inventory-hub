-- 1. Create inventories table using created_by_user_id (matches existing DB column name)
CREATE TABLE IF NOT EXISTS "inventories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_user_id" text NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 2. Add is_default if the table pre-existed without it
ALTER TABLE "inventories" ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false NOT NULL;
--> statement-breakpoint

-- 3. Index on created_by_user_id
CREATE INDEX IF NOT EXISTS "inventories_user_id_idx" ON "inventories" USING btree ("created_by_user_id");
--> statement-breakpoint

-- 4. Add inventory_id to assets if not yet present
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "inventory_id" uuid;
--> statement-breakpoint

-- 5. Add quantity to assets if not yet present
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "quantity" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

-- 6. Create a "Main" default inventory for users with assets but no inventory
INSERT INTO "inventories" ("created_by_user_id", "name", "is_default")
SELECT DISTINCT a."created_by_user_id", 'Main', true
FROM "assets" a
WHERE NOT EXISTS (
  SELECT 1 FROM "inventories" i WHERE i."created_by_user_id" = a."created_by_user_id"
);
--> statement-breakpoint

-- 7. Mark the oldest inventory as default for users who have none marked
UPDATE "inventories" SET "is_default" = true
WHERE "id" IN (
  SELECT DISTINCT ON ("created_by_user_id") "id"
  FROM "inventories"
  WHERE "created_by_user_id" NOT IN (
    SELECT "created_by_user_id" FROM "inventories" WHERE "is_default" = true
  )
  ORDER BY "created_by_user_id", "created_at"
);
--> statement-breakpoint

-- 8. Assign unassigned assets to their user's default inventory
UPDATE "assets" a
SET "inventory_id" = i."id"
FROM "inventories" i
WHERE i."created_by_user_id" = a."created_by_user_id"
  AND i."is_default" = true
  AND a."inventory_id" IS NULL;
--> statement-breakpoint

-- 9. Make inventory_id NOT NULL (all rows should be assigned by step 8)
ALTER TABLE "assets" ALTER COLUMN "inventory_id" SET NOT NULL;
--> statement-breakpoint

-- 10. Drop FK if it already exists, then re-add cleanly
ALTER TABLE "assets" DROP CONSTRAINT IF EXISTS "assets_inventory_id_inventories_id_fk";
--> statement-breakpoint

ALTER TABLE "assets" ADD CONSTRAINT "assets_inventory_id_inventories_id_fk"
  FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
--> statement-breakpoint

-- 11. Index on assets.inventory_id
CREATE INDEX IF NOT EXISTS "assets_inventory_id_idx" ON "assets" USING btree ("inventory_id");
