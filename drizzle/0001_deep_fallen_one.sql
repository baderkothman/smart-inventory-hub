ALTER TABLE "assets" ADD COLUMN "created_by_user_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "assets_created_by_idx" ON "assets" USING btree ("created_by_user_id");