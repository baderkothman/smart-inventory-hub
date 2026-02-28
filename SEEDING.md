# Seeding Mock Data — Smart Inventory Hub

Quick guide to get a fully-populated local environment with realistic product data.

---

## Prerequisites

1. Bun 1.x installed
2. `.env.local` with valid `CLERK_SECRET_KEY`, `DATABASE_URL` (and optionally `DATABASE_URL_DIRECT` for direct connections)
3. Dependencies installed:

```bash
bun install
```

---

## Step-by-step

### 1. Apply database migrations

```bash
bun drizzle-kit push
```

Run this whenever the Drizzle schema changes (safe to re-run).

### 2. Run the seed script

```bash
bun run seed
```

Equivalent long-form:

```bash
bun scripts/seed.ts --dev
```

With a custom admin email:

```bash
TEST_EMAIL=you@company.com bun run seed
```

With custom email + password:

```bash
TEST_EMAIL=you@company.com TEST_PASSWORD=MySecret99! bun run seed
```

### 3. Start the dev server

```bash
bun dev
```

Open <http://localhost:3000/sign-in> and log in with the credentials printed by the seed script.

---

## Demo Credentials

The seed script prints credentials after it finishes. Defaults (if no `TEST_EMAIL` is set):

| User | Email | Password |
|------|-------|----------|
| Jordan Rivera | admin@inventoryhub.dev | Admin@Demo2024! |
| Sophia Park | sophia@inventoryhub.dev | Sophia@Demo2024! |

**Note:** On every re-run, all data is wiped and recreated from scratch. Clerk user
passwords are reset to the values above, so the printed credentials are always current.

---

## What gets seeded

The seeder **wipes all assets and inventories** from the database before inserting
fresh data, giving you a clean slate every time.

### Jordan Rivera (`admin@inventoryhub.dev`) — 3 inventories, 17 assets

| Inventory | Count | Highlights |
|-----------|-------|-----------|
| IT Equipment *(default)* | 7 | MacBook Pro 16", ThinkPad X1 Carbon, Dell XPS 15, LG UltraWide, Dell UltraSharp 4K, CalDigit TS4, Keychron K8 Pro |
| Software Licenses | 6 | Adobe CC, Microsoft 365, Figma Pro, GitHub Enterprise, Slack Business+ (+ retired Zoom) |
| Office Supplies | 4 | Herman Miller Aeron, FlexiSpot E7 Pro desk, Logitech MX Master 3S, Elgato Key Light |

### Sophia Park (`sophia@inventoryhub.dev`) — 2 inventories, 10 assets

| Inventory | Count | Highlights |
|-----------|-------|-----------|
| Developer Hardware *(default)* | 5 | MacBook Air M3, Surface Pro 9, Samsung Odyssey G7, iPad Pro 12.9", Apple Pencil 2 |
| Accessories & Peripherals | 5 | Anker 10-in-1 hub, AirPods Pro 2, Sony WH-1000XM5 (retired), Notion Team, Linear Workspace |

All assets include:
- **Product images** sourced from Unsplash (stable public CDN)
- **Descriptions** with real specs
- **Serial numbers** where applicable
- **Purchase / warranty dates**
- A mix of `IN_STOCK`, `ASSIGNED`, and `RETIRED` statuses for realistic analytics

---

## Full wipe behaviour

Unlike the previous seeder (which only wiped per-user data), the current script
**deletes all rows** from `assets` and `inventories` before inserting, regardless
of which Clerk user owns them:

```ts
await db.delete(assetsTable);        // all assets
await db.delete(inventoriesTable);   // all inventories
```

This ensures a perfectly clean state every run.

---

## Idempotency

Safe to re-run at any time:

- **Clerk users** — reused if they already exist; password is reset each run.
- **DB data** — deleted and re-inserted from scratch.
- **No duplicates** — the wipe step guarantees a clean slate.

---

## Environment gate

The script refuses to run unless one of these is true:

| Condition | Example |
|-----------|---------|
| `NODE_ENV=development` | Set automatically by `bun dev` |
| `SEED_MOCK_DATA=true` | Explicit opt-in for CI |
| `--dev` CLI flag | Added by `bun run seed` |

This prevents accidental seeding against a production database.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing CLERK_SECRET_KEY` | Check `.env.local` is present and complete |
| `Clerk POST /users → 422` | Enable Email+Password auth in Clerk dashboard under **User & Authentication → Email, Phone, Username** |
| `column "..." does not exist` | Run `bun drizzle-kit push` to apply schema changes |
| Seed prints credentials but login fails | Check Clerk dashboard → **Users** to confirm account exists |
| Images don't load | Images use Unsplash CDN URLs — verify internet access. `images.unsplash.com` is already in `next.config.ts` `remotePatterns`. |

---

## Files

| File | Purpose |
|------|---------|
| `scripts/seed.ts` | The seeder — edit `SEED_USERS` and `IMG` to change data/images |
| `src/db/schema.ts` | Drizzle schema (assets + inventories tables) |
| `.env.local` | Secrets (never commit) |
