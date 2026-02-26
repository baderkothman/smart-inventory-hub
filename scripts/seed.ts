#!/usr/bin/env tsx
/**
 * scripts/seed.ts — Smart Inventory Hub mock-data seeder (dev only)
 *
 * HOW TO RUN
 *   npm run seed
 *   # or directly:
 *   SEED_MOCK_DATA=true npx tsx scripts/seed.ts
 *   # with a custom admin email:
 *   TEST_EMAIL=you@company.com SEED_MOCK_DATA=true npx tsx scripts/seed.ts
 *
 * WHAT IT DOES
 *   1. Creates (or reuses) 2 test users in Clerk via the Management API.
 *   2. Wipes then recreates all inventories + assets for those users in Postgres.
 *   3. Prints demo credentials to the terminal.
 *
 * IDEMPOTENCY
 *   Re-running is safe.  Existing seed-user data is deleted then re-inserted.
 *   Clerk users are reused (password is reset to the value below on each run).
 *
 * ENVIRONMENT GATE
 *   Only runs when NODE_ENV=development  OR  SEED_MOCK_DATA=true  OR  --dev flag.
 */

// ── Load env ──────────────────────────────────────────────────────────────
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ── Environment gate ──────────────────────────────────────────────────────
const ALLOWED =
  process.env.NODE_ENV === "development" ||
  process.env.SEED_MOCK_DATA === "true" ||
  process.argv.includes("--dev");

if (!ALLOWED) {
  console.error(
    "\n❌  Seeder blocked.\n" +
      "    Set NODE_ENV=development or SEED_MOCK_DATA=true, " +
      "or pass the --dev flag.\n",
  );
  process.exit(1);
}

// ── Validate env vars ─────────────────────────────────────────────────────
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("❌  Missing CLERK_SECRET_KEY in .env.local");
  process.exit(1);
}

const DATABASE_URL =
  process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  Missing DATABASE_URL / DATABASE_URL_DIRECT in .env.local");
  process.exit(1);
}

// ── DB setup ──────────────────────────────────────────────────────────────
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

// Relative imports so this file works outside Next.js without path aliases
import {
  assets as assetsTable,
  inventories as inventoriesTable,
} from "../src/db/schema.js";

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// ── Clerk REST helpers ────────────────────────────────────────────────────
const CLERK_BASE = "https://api.clerk.com/v1";
const AUTH_HDR = {
  Authorization: `Bearer ${CLERK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

async function clerkFetch<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${CLERK_BASE}${path}`, {
    method,
    headers: AUTH_HDR,
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  const data = (await res.json()) as T;
  if (!res.ok) {
    throw new Error(
      `Clerk ${method} ${path} → ${res.status}\n${JSON.stringify(data, null, 2)}`,
    );
  }
  return data;
}

interface ClerkUser {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
}

async function findClerkUserByEmail(email: string): Promise<ClerkUser | null> {
  const list = await clerkFetch<ClerkUser[]>(
    "GET",
    `/users?email_address=${encodeURIComponent(email)}&limit=1`,
  );
  return list.length > 0 ? list[0] : null;
}

/**
 * Returns the Clerk user ID for `email`.
 * Creates the user if not found; resets the password on every run.
 */
async function upsertClerkUser(opts: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ clerkId: string; wasCreated: boolean }> {
  const existing = await findClerkUserByEmail(opts.email);

  if (existing) {
    // Reset password so the printed credentials are always valid
    await clerkFetch("PATCH", `/users/${existing.id}`, {
      password: opts.password,
      skip_password_checks: true,
    });
    return { clerkId: existing.id, wasCreated: false };
  }

  const created = await clerkFetch<ClerkUser>("POST", "/users", {
    email_address: [opts.email],
    password: opts.password,
    first_name: opts.firstName,
    last_name: opts.lastName,
    skip_password_checks: true,
  });
  return { clerkId: created.id, wasCreated: true };
}

// ── Seed data definition ──────────────────────────────────────────────────

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

interface SeedAsset {
  type: AssetType;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  quantity: number;
  status: AssetStatus;
  purchaseDate?: string; // YYYY-MM-DD
  warrantyEndDate?: string;
  description?: string;
}

interface SeedInventory {
  name: string;
  isDefault: boolean;
  assets: SeedAsset[];
}

interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inventories: SeedInventory[];
}

// The first user's email can be overridden via TEST_EMAIL env var
const ADMIN_EMAIL = process.env.TEST_EMAIL ?? "admin@inventoryhub.dev";
const ADMIN_PASSWORD = process.env.TEST_PASSWORD ?? "Admin@Demo2024!";

const SEED_USERS: SeedUser[] = [
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    firstName: "Alex",
    lastName: "Admin",
    inventories: [
      {
        name: "IT Equipment",
        isDefault: true,
        assets: [
          {
            type: "LAPTOP",
            name: 'MacBook Pro 16"',
            brand: "Apple",
            model: "MBP16-M3-Pro",
            serialNumber: "C02XG2JQJGH7",
            quantity: 5,
            status: "IN_STOCK",
            purchaseDate: "2024-01-15",
            warrantyEndDate: "2027-01-15",
            description: "16-inch MacBook Pro with M3 Pro chip, 36 GB RAM.",
          },
          {
            type: "LAPTOP",
            name: "ThinkPad X1 Carbon Gen 11",
            brand: "Lenovo",
            model: "21HN-005BUS",
            serialNumber: "LNV-2024-X1-011",
            quantity: 12,
            status: "IN_STOCK",
            purchaseDate: "2024-03-01",
            warrantyEndDate: "2027-03-01",
            description:
              "Ultra-light 14-inch business laptop, Core i7, 32 GB RAM.",
          },
          {
            type: "LAPTOP",
            name: "Dell XPS 15 9530",
            brand: "Dell",
            model: "XPS15-9530-i9",
            quantity: 3,
            status: "ASSIGNED",
            purchaseDate: "2023-09-10",
            warrantyEndDate: "2026-09-10",
            description: "15.6-inch OLED 4K, Core i9, 64 GB RAM.",
          },
          {
            type: "MONITOR",
            name: 'LG UltraWide 34"',
            brand: "LG",
            model: "34WN80C-B",
            quantity: 8,
            status: "IN_STOCK",
            purchaseDate: "2023-06-20",
            warrantyEndDate: "2026-06-20",
          },
          {
            type: "MONITOR",
            name: 'Dell UltraSharp 27" 4K',
            brand: "Dell",
            model: "U2723DE",
            serialNumber: "DEL-MON-2023-047",
            quantity: 15,
            status: "IN_STOCK",
            purchaseDate: "2023-11-05",
            warrantyEndDate: "2026-11-05",
          },
          {
            type: "OTHER",
            name: "CalDigit TS4 Thunderbolt Dock",
            brand: "CalDigit",
            model: "TS4",
            quantity: 20,
            status: "IN_STOCK",
            purchaseDate: "2024-01-20",
          },
          {
            type: "OTHER",
            name: "Keychron K3 Pro Keyboard",
            brand: "Keychron",
            model: "K3-Pro-V2",
            quantity: 0,
            status: "RETIRED",
            description: "Retired — replaced with K8 Pro.",
          },
        ],
      },
      {
        name: "Software Licenses",
        isDefault: false,
        assets: [
          {
            type: "LICENSE",
            name: "Adobe Creative Cloud (All Apps)",
            brand: "Adobe",
            quantity: 25,
            status: "IN_STOCK",
            description: "Annual team plan — 25 seats.",
          },
          {
            type: "LICENSE",
            name: "Microsoft 365 Business Premium",
            brand: "Microsoft",
            quantity: 50,
            status: "IN_STOCK",
            description: "Includes Teams, Exchange, SharePoint, Intune.",
          },
          {
            type: "LICENSE",
            name: "Figma Professional",
            brand: "Figma",
            quantity: 10,
            status: "ASSIGNED",
          },
          {
            type: "LICENSE",
            name: "GitHub Enterprise Cloud",
            brand: "GitHub",
            quantity: 100,
            status: "IN_STOCK",
            description: "Org-level. Includes Actions, SAML SSO, audit log.",
          },
          {
            type: "LICENSE",
            name: "Slack Business+",
            brand: "Slack",
            quantity: 50,
            status: "IN_STOCK",
          },
          {
            type: "LICENSE",
            name: "Zoom Business (legacy)",
            brand: "Zoom",
            quantity: 0,
            status: "RETIRED",
            description: "Replaced by Microsoft Teams.",
          },
        ],
      },
      {
        name: "Office Supplies",
        isDefault: false,
        assets: [
          {
            type: "OTHER",
            name: "Herman Miller Aeron Chair (Size B)",
            brand: "Herman Miller",
            model: "AE1B23DW BKBK G1",
            quantity: 45,
            status: "IN_STOCK",
            purchaseDate: "2022-08-01",
          },
          {
            type: "OTHER",
            name: "FlexiSpot E7 Standing Desk",
            brand: "FlexiSpot",
            model: "E7-W",
            quantity: 12,
            status: "IN_STOCK",
          },
          {
            type: "OTHER",
            name: "Logitech MX Master 3S Mouse",
            brand: "Logitech",
            model: "910-006556",
            quantity: 30,
            status: "IN_STOCK",
          },
          {
            type: "OTHER",
            name: "Elgato Key Light",
            brand: "Elgato",
            model: "10GAK9901",
            quantity: 1,
            status: "ASSIGNED",
          },
        ],
      },
    ],
  },

  {
    email: "alice@inventoryhub.dev",
    password: "Alice@Demo2024!",
    firstName: "Alice",
    lastName: "Chen",
    inventories: [
      {
        name: "Hardware",
        isDefault: true,
        assets: [
          {
            type: "LAPTOP",
            name: "MacBook Air M2 13-inch",
            brand: "Apple",
            model: "MLXY3LL/A",
            quantity: 3,
            status: "IN_STOCK",
            purchaseDate: "2023-07-01",
            warrantyEndDate: "2026-07-01",
          },
          {
            type: "LAPTOP",
            name: "Surface Pro 9 i7",
            brand: "Microsoft",
            model: "QIL-00001",
            quantity: 2,
            status: "ASSIGNED",
            purchaseDate: "2023-10-15",
          },
          {
            type: "MONITOR",
            name: "Samsung Odyssey G7 32-inch",
            brand: "Samsung",
            model: "LC32G75TQSNXZA",
            quantity: 4,
            status: "IN_STOCK",
          },
          {
            type: "OTHER",
            name: 'iPad Pro 12.9" (6th Gen)',
            brand: "Apple",
            model: "MNXR3LL/A",
            quantity: 6,
            status: "IN_STOCK",
            purchaseDate: "2023-04-05",
            warrantyEndDate: "2026-04-05",
          },
          {
            type: "OTHER",
            name: "Apple Pencil 2nd Gen",
            brand: "Apple",
            model: "MU8F2AM/A",
            quantity: 6,
            status: "IN_STOCK",
          },
        ],
      },
      {
        name: "Peripherals",
        isDefault: false,
        assets: [
          {
            type: "OTHER",
            name: "Anker 563 USB-C Hub (10-in-1)",
            brand: "Anker",
            model: "A83490A1",
            quantity: 8,
            status: "IN_STOCK",
          },
          {
            type: "OTHER",
            name: "AirPods Pro 2nd Gen",
            brand: "Apple",
            model: "MQD83LL/A",
            serialNumber: "APPL-APP2-0042",
            quantity: 5,
            status: "IN_STOCK",
            purchaseDate: "2023-09-22",
            warrantyEndDate: "2024-09-22",
          },
          {
            type: "OTHER",
            name: "Sony WH-1000XM5",
            brand: "Sony",
            model: "WH1000XM5/B",
            quantity: 0,
            status: "RETIRED",
            description: "Retired — replaced with AirPods Pro.",
          },
          {
            type: "LICENSE",
            name: "Notion Team Plan",
            brand: "Notion",
            quantity: 15,
            status: "IN_STOCK",
            description: "15-seat team workspace.",
          },
          {
            type: "LICENSE",
            name: "Loom Business",
            brand: "Loom",
            quantity: 10,
            status: "IN_STOCK",
          },
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function banner(text: string) {
  const line = "─".repeat(50);
  console.log(`\n${line}\n  ${text}\n${line}`);
}

// ── Main ──────────────────────────────────────────────────────────────────

interface SeedResult {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  clerkId: string;
  wasCreated: boolean;
  inventoryCount: number;
  assetCount: number;
}

async function main() {
  banner("Smart Inventory Hub — Mock Data Seeder");
  console.log("  Mode : dev seed");
  console.log(`  Users: ${SEED_USERS.length}`);
  console.log();

  const results: SeedResult[] = [];

  for (const seedUser of SEED_USERS) {
    console.log(`\n👤  ${seedUser.firstName} ${seedUser.lastName} <${seedUser.email}>`);

    // ── 1. Upsert Clerk user ─────────────────────────────────────────────
    process.stdout.write("   Clerk … ");
    const { clerkId, wasCreated } = await upsertClerkUser({
      email: seedUser.email,
      password: seedUser.password,
      firstName: seedUser.firstName,
      lastName: seedUser.lastName,
    });
    console.log(wasCreated ? `created  (${clerkId})` : `found  (${clerkId}), password reset`);

    // ── 2. Wipe existing DB data for this user (idempotency) ─────────────
    process.stdout.write("   DB wipe … ");
    await db.delete(assetsTable).where(eq(assetsTable.createdByUserId, clerkId));
    await db.delete(inventoriesTable).where(eq(inventoriesTable.userId, clerkId));
    console.log("done");

    // ── 3. Insert inventories + assets ───────────────────────────────────
    let totalAssets = 0;

    for (const inv of seedUser.inventories) {
      process.stdout.write(`   📦  "${inv.name}" … `);

      const [newInv] = await db
        .insert(inventoriesTable)
        .values({
          userId: clerkId,
          name: inv.name,
          isDefault: inv.isDefault,
        })
        .returning({ id: inventoriesTable.id });

      if (inv.assets.length > 0) {
        await db.insert(assetsTable).values(
          inv.assets.map((a) => ({
            createdByUserId: clerkId,
            inventoryId: newInv.id,
            type: a.type,
            name: a.name,
            brand: a.brand ?? null,
            model: a.model ?? null,
            serialNumber: a.serialNumber ?? null,
            quantity: a.quantity,
            status: a.status,
            purchaseDate: a.purchaseDate ?? null,
            warrantyEndDate: a.warrantyEndDate ?? null,
            description: a.description ?? null,
          })),
        );
      }

      console.log(`${inv.assets.length} assets`);
      totalAssets += inv.assets.length;
    }

    results.push({
      email: seedUser.email,
      password: seedUser.password,
      firstName: seedUser.firstName,
      lastName: seedUser.lastName,
      clerkId,
      wasCreated,
      inventoryCount: seedUser.inventories.length,
      assetCount: totalAssets,
    });
  }

  // ── Print credentials ──────────────────────────────────────────────────
  banner("✅  Seeding complete — Demo Credentials");

  for (const r of results) {
    const tag = r.wasCreated ? "🆕 created" : "♻️  updated";
    console.log(`\n  ${r.firstName} ${r.lastName}  [${tag}]`);
    console.log(`    Email      : ${r.email}`);
    console.log(`    Password   : ${r.password}`);
    console.log(`    Clerk ID   : ${r.clerkId}`);
    console.log(
      `    Data       : ${r.inventoryCount} inventories, ${r.assetCount} assets`,
    );
  }

  console.log("\n  Sign-in URL : http://localhost:3000/sign-in");
  console.log(
    "\n  ⚠️  Dev-only credentials — never commit TEST_PASSWORD to production.",
  );

  const line = "─".repeat(50);
  console.log(`\n${line}\n`);
}

main().catch((err: unknown) => {
  console.error("\n💥  Seed failed:", err);
  process.exit(1);
});
