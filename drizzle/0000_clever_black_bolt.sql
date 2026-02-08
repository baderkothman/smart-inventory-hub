CREATE TYPE "public"."asset_status" AS ENUM('IN_STOCK', 'ASSIGNED', 'RETIRED');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('LAPTOP', 'MONITOR', 'LICENSE', 'OTHER');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "asset_type" NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"model" text,
	"serial_number" text,
	"status" "asset_status" DEFAULT 'IN_STOCK' NOT NULL,
	"assigned_to_user_id" text,
	"purchase_date" date,
	"warranty_end_date" date,
	"description" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
