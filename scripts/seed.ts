#!/usr/bin/env tsx
/**
 * scripts/seed.ts — Smart Inventory Hub mock-data seeder (dev only)
 *
 * HOW TO RUN
 *   bun run seed
 *   # or directly:
 *   bun scripts/seed.ts --dev
 *   # with a custom admin email:
 *   TEST_EMAIL=you@company.com bun run seed
 *
 * WHAT IT DOES
 *   1. Creates (or reuses) 2 test users in Clerk via the Management API.
 *   2. Wipes ALL inventories + assets from the DB (full clean slate).
 *   3. Inserts fresh inventories + assets with images for each user.
 *   4. Prints demo credentials to the terminal.
 *
 * IDEMPOTENCY
 *   Re-running is safe. DB is fully wiped each run.
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

async function upsertClerkUser(opts: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ clerkId: string; wasCreated: boolean }> {
  const existing = await findClerkUserByEmail(opts.email);

  if (existing) {
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
  purchaseDate?: string;
  warrantyEndDate?: string;
  description?: string;
  imageUrl?: string;
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

// Stable Unsplash image URLs — each photo_id is a permanent public resource
const IMG = {
  macbook:
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
  thinkpad:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
  dell_xps:
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
  lg_monitor:
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",
  dell_monitor:
    "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&q=80",
  dock: "https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400&q=80",
  keyboard:
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
  adobe:
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
  microsoft365:
    "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&q=80",
  figma:
    "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&q=80",
  github:
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&q=80",
  slack:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
  chair:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
  desk: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=400&q=80",
  mouse:
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
  light:
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80",
  macbook_air:
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",
  surface:
    "https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?w=400&q=80",
  samsung_mon:
    "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=400&q=80",
  ipad: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
  pencil:
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=80",
  hub: "https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400&q=80",
  airpods:
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80",
  sony_wh:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  notion:
    "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&q=80",
  linear:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
};

const ADMIN_EMAIL = process.env.TEST_EMAIL ?? "admin@inventoryhub.dev";
const ADMIN_PASSWORD = process.env.TEST_PASSWORD ?? "Admin@Demo2024!";

const SEED_USERS: SeedUser[] = [
  /* ── Jordan Rivera ─────────────────────────────────────────── */
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    firstName: "Jordan",
    lastName: "Rivera",
    inventories: [
      {
        name: "IT Equipment",
        isDefault: false,
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
            description:
              "16-inch MacBook Pro with M3 Pro chip, 36 GB unified memory, 512 GB SSD. Primary dev machine.",
            imageUrl: IMG.macbook,
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
              "Ultra-light 14-inch business laptop, Intel Core i7-1365U, 32 GB LPDDR5, 1 TB NVMe SSD.",
            imageUrl: IMG.thinkpad,
          },
          {
            type: "LAPTOP",
            name: "Dell XPS 15 9530",
            brand: "Dell",
            model: "XPS15-9530-i9",
            serialNumber: "DLXPS9530-004",
            quantity: 3,
            status: "ASSIGNED",
            purchaseDate: "2023-09-10",
            warrantyEndDate: "2026-09-10",
            description:
              "15.6-inch OLED 3.5K touch display, Core i9-13900H, 64 GB DDR5, 2 TB SSD.",
            imageUrl: IMG.dell_xps,
          },
          {
            type: "MONITOR",
            name: 'LG UltraWide 34"',
            brand: "LG",
            model: "34WN80C-B",
            serialNumber: "LG-MON-34-0071",
            quantity: 8,
            status: "IN_STOCK",
            purchaseDate: "2023-06-20",
            warrantyEndDate: "2026-06-20",
            description:
              "34-inch IPS curved ultrawide, 3440×1440, USB-C 96 W charging, HDR10.",
            imageUrl: IMG.lg_monitor,
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
            description:
              "27-inch IPS 4K UHD, USB-C hub, RJ45, 60 W Power Delivery. TÜV eye-comfort certified.",
            imageUrl: IMG.dell_monitor,
          },
          {
            type: "OTHER",
            name: "CalDigit TS4 Thunderbolt 4 Dock",
            brand: "CalDigit",
            model: "TS4",
            serialNumber: "CDG-TS4-00198",
            quantity: 20,
            status: "IN_STOCK",
            purchaseDate: "2024-01-20",
            warrantyEndDate: "2027-01-20",
            description:
              "18-port Thunderbolt 4 dock. 98 W host charging, dual 4K60 displays, 2.5 GbE.",
            imageUrl: IMG.dock,
          },
          {
            type: "OTHER",
            name: "Keychron K8 Pro Keyboard",
            brand: "Keychron",
            model: "K8-Pro-RGB",
            quantity: 10,
            status: "IN_STOCK",
            purchaseDate: "2024-02-10",
            warrantyEndDate: "2025-02-10",
            description:
              "TKL wireless mechanical keyboard, hot-swap, RGB. Gateron G Pro Red switches.",
            imageUrl: IMG.keyboard,
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
            purchaseDate: "2024-01-01",
            warrantyEndDate: "2025-01-01",
            description:
              "Annual team plan — 25 seats. Includes Photoshop, Illustrator, Premiere Pro, After Effects.",
            imageUrl: IMG.adobe,
          },
          {
            type: "LICENSE",
            name: "Microsoft 365 Business Premium",
            brand: "Microsoft",
            quantity: 50,
            status: "IN_STOCK",
            purchaseDate: "2024-01-01",
            warrantyEndDate: "2025-01-01",
            description:
              "50-seat plan. Includes Teams, Exchange, SharePoint, OneDrive, Intune, Defender.",
            imageUrl: IMG.microsoft365,
          },
          {
            type: "LICENSE",
            name: "Figma Professional",
            brand: "Figma",
            quantity: 10,
            status: "ASSIGNED",
            purchaseDate: "2024-04-01",
            warrantyEndDate: "2025-04-01",
            description:
              "10-seat Figma Pro plan. Unlimited projects, version history, team libraries.",
            imageUrl: IMG.figma,
          },
          {
            type: "LICENSE",
            name: "GitHub Enterprise Cloud",
            brand: "GitHub",
            quantity: 100,
            status: "IN_STOCK",
            purchaseDate: "2024-01-01",
            warrantyEndDate: "2025-01-01",
            description:
              "Org-level Enterprise Cloud. SAML SSO, audit log, GitHub Actions, Advanced Security.",
            imageUrl: IMG.github,
          },
          {
            type: "LICENSE",
            name: "Slack Business+",
            brand: "Slack",
            quantity: 50,
            status: "IN_STOCK",
            purchaseDate: "2024-01-01",
            warrantyEndDate: "2025-01-01",
            description:
              "50-seat Business+ plan. Unlimited message history, huddles, guest access.",
            imageUrl: IMG.slack,
          },
          {
            type: "LICENSE",
            name: "Zoom Business (legacy)",
            brand: "Zoom",
            quantity: 0,
            status: "RETIRED",
            description: "Decommissioned — fully replaced by Microsoft Teams.",
            imageUrl: IMG.slack,
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
            warrantyEndDate: "2034-08-01",
            description:
              "Ergonomic task chair. PostureFit SL lumbar support, 8Z Pellicle mesh, 12-year warranty.",
            imageUrl: IMG.chair,
          },
          {
            type: "OTHER",
            name: "FlexiSpot E7 Pro Standing Desk",
            brand: "FlexiSpot",
            model: "E7-Pro-W",
            quantity: 12,
            status: "IN_STOCK",
            purchaseDate: "2023-03-15",
            warrantyEndDate: "2028-03-15",
            description:
              "Electric height-adjustable desk frame. Dual motor, 355 lb capacity, 3-stage legs.",
            imageUrl: IMG.desk,
          },
          {
            type: "OTHER",
            name: "Logitech MX Master 3S Mouse",
            brand: "Logitech",
            model: "910-006556",
            quantity: 30,
            status: "IN_STOCK",
            purchaseDate: "2023-07-01",
            warrantyEndDate: "2025-07-01",
            description:
              "8000 DPI MagSpeed scroll, Bluetooth/USB, 70-day battery. Silent electromagnetic scroll.",
            imageUrl: IMG.mouse,
          },
          {
            type: "OTHER",
            name: "Elgato Key Light",
            brand: "Elgato",
            model: "10GAK9901",
            serialNumber: "ELG-KL-0017",
            quantity: 1,
            status: "ASSIGNED",
            purchaseDate: "2023-10-05",
            warrantyEndDate: "2025-10-05",
            description:
              "Professional studio light. 2500 lumens, 2900–7000 K adjustable, app & Stream Deck control.",
            imageUrl: IMG.light,
          },
        ],
      },
    ],
  },

  /* ── Sophia Park ───────────────────────────────────────────── */
  {
    email: "sophia@inventoryhub.dev",
    password: "Sophia@Demo2024!",
    firstName: "Sophia",
    lastName: "Park",
    inventories: [
      {
        name: "Developer Hardware",
        isDefault: false,
        assets: [
          {
            type: "LAPTOP",
            name: "MacBook Air M3 13-inch",
            brand: "Apple",
            model: "MRXN3LL/A",
            serialNumber: "C02YM3ABMD6V",
            quantity: 3,
            status: "IN_STOCK",
            purchaseDate: "2024-03-08",
            warrantyEndDate: "2027-03-08",
            description:
              "13-inch MacBook Air, Apple M3 chip, 16 GB unified memory, 512 GB SSD. Fanless design.",
            imageUrl: IMG.macbook_air,
          },
          {
            type: "LAPTOP",
            name: "Surface Pro 9 i7",
            brand: "Microsoft",
            model: "QIL-00001",
            serialNumber: "MSF-SP9-0023",
            quantity: 2,
            status: "ASSIGNED",
            purchaseDate: "2023-10-15",
            warrantyEndDate: "2026-10-15",
            description:
              "13-inch 2-in-1 tablet/laptop. Core i7-1255U, 16 GB LPDDR5, 256 GB SSD, 120 Hz display.",
            imageUrl: IMG.surface,
          },
          {
            type: "MONITOR",
            name: 'Samsung Odyssey G7 32"',
            brand: "Samsung",
            model: "LC32G75TQSNXZA",
            serialNumber: "SAM-G7-32-0055",
            quantity: 4,
            status: "IN_STOCK",
            purchaseDate: "2023-05-20",
            warrantyEndDate: "2026-05-20",
            description:
              "32-inch QHDI 1440p curved VA, 240 Hz, 1 ms, G-Sync compatible, HDR600.",
            imageUrl: IMG.samsung_mon,
          },
          {
            type: "OTHER",
            name: 'iPad Pro 12.9" (6th Gen)',
            brand: "Apple",
            model: "MNXR3LL/A",
            serialNumber: "DMPGJ3WJPN4X",
            quantity: 6,
            status: "IN_STOCK",
            purchaseDate: "2023-04-05",
            warrantyEndDate: "2026-04-05",
            description:
              "12.9-inch iPad Pro. Apple M2 chip, Liquid Retina XDR mini-LED, Thunderbolt 4, 5G.",
            imageUrl: IMG.ipad,
          },
          {
            type: "OTHER",
            name: "Apple Pencil 2nd Gen",
            brand: "Apple",
            model: "MU8F2AM/A",
            quantity: 6,
            status: "IN_STOCK",
            purchaseDate: "2023-04-05",
            warrantyEndDate: "2025-04-05",
            description:
              "Wireless magnetic charging, double-tap gesture, tilt sensitivity, 4096 pressure levels.",
            imageUrl: IMG.pencil,
          },
        ],
      },
      {
        name: "Accessories & Peripherals",
        isDefault: false,
        assets: [
          {
            type: "OTHER",
            name: "Anker 563 USB-C Hub (10-in-1)",
            brand: "Anker",
            model: "A83490A1",
            quantity: 8,
            status: "IN_STOCK",
            purchaseDate: "2023-08-12",
            warrantyEndDate: "2025-08-12",
            description:
              "10-in-1 USB-C dock. 100 W PD, 4K HDMI, 2×USB-A 3.2, microSD/SD, 3.5 mm audio.",
            imageUrl: IMG.hub,
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
            warrantyEndDate: "2025-09-22",
            description:
              "Active noise cancellation, Adaptive Transparency, Personalized Spatial Audio, USB-C case.",
            imageUrl: IMG.airpods,
          },
          {
            type: "OTHER",
            name: "Sony WH-1000XM5",
            brand: "Sony",
            model: "WH1000XM5/B",
            quantity: 0,
            status: "RETIRED",
            description:
              "Retired — replaced with AirPods Pro 2. 30-hr battery, LDAC, multipoint connection.",
            imageUrl: IMG.sony_wh,
          },
          {
            type: "LICENSE",
            name: "Notion Team Plan",
            brand: "Notion",
            quantity: 15,
            status: "IN_STOCK",
            purchaseDate: "2024-01-01",
            warrantyEndDate: "2025-01-01",
            description:
              "15-seat team workspace. Unlimited blocks, collaborative docs, wikis, databases.",
            imageUrl: IMG.notion,
          },
          {
            type: "LICENSE",
            name: "Linear Workspace",
            brand: "Linear",
            quantity: 10,
            status: "IN_STOCK",
            purchaseDate: "2024-01-01",
            warrantyEndDate: "2025-01-01",
            description:
              "10-seat Linear Business plan. Issue tracking, cycles, roadmaps, GitHub sync.",
            imageUrl: IMG.linear,
          },
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function banner(text: string) {
  const line = "─".repeat(54);
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

  // ── Full DB wipe (all users) ─────────────────────────────────────────
  process.stdout.write("  🗑️  Wiping all assets … ");
  await db.delete(assetsTable);
  console.log("done");

  process.stdout.write("  🗑️  Wiping all inventories … ");
  await db.delete(inventoriesTable);
  console.log("done");

  const results: SeedResult[] = [];

  for (const seedUser of SEED_USERS) {
    console.log(
      `\n👤  ${seedUser.firstName} ${seedUser.lastName} <${seedUser.email}>`,
    );

    // ── Upsert Clerk user ────────────────────────────────────────────────
    process.stdout.write("   Clerk … ");
    const { clerkId, wasCreated } = await upsertClerkUser({
      email: seedUser.email,
      password: seedUser.password,
      firstName: seedUser.firstName,
      lastName: seedUser.lastName,
    });
    console.log(
      wasCreated
        ? `created  (${clerkId})`
        : `found  (${clerkId}), password reset`,
    );

    // ── Insert inventories + assets ──────────────────────────────────────
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
            imageUrl: a.imageUrl ?? null,
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

  const line = "─".repeat(54);
  console.log(`\n${line}\n`);
}

main().catch((err: unknown) => {
  console.error("\n💥  Seed failed:", err);
  process.exit(1);
});
