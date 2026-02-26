# Seeding Mock Data — Smart Inventory Hub

Quick guide to get a fully-populated local environment for end-to-end testing.

---

## Prerequisites

1. Node.js 18+ (or 20+)
2. `.env.local` with valid `CLERK_SECRET_KEY`, `DATABASE_URL`, and `DATABASE_URL_DIRECT`
3. All npm packages installed:

```bash
npm install
```

---

## Step-by-step

### 1. Apply database migrations

```bash
npx drizzle-kit migrate
```

Run this whenever schema changes are present (safe to re-run — migrations are tracked).

### 2. Run the seed script

```bash
npm run seed
```

Equivalent long-form (cross-platform):

```bash
npx tsx scripts/seed.ts --dev
```

With a custom admin email (mirrors your company username):

```bash
TEST_EMAIL=you@company.com npm run seed
```

With a custom password:

```bash
TEST_EMAIL=you@company.com TEST_PASSWORD=MySecret99! npm run seed
```

### 3. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000/sign-in> and log in with the credentials printed by the seed script.

---

## Demo Credentials

The seed script prints credentials after it finishes. Defaults (if no `TEST_EMAIL` is set):

| User  | Email                    | Password         | Role  |
|-------|--------------------------|------------------|-------|
| Alex  | admin@inventoryhub.dev   | Admin@Demo2024!  | Admin |
| Alice | alice@inventoryhub.dev   | Alice@Demo2024!  | User  |

**Note:** On every re-run the password is reset to the value above, so the printed
credentials are always current.

---

## What gets seeded

### Alex Admin (`admin@inventoryhub.dev`) — 3 inventories, 17 assets

| Inventory | Assets |
|-----------|--------|
| IT Equipment *(default)* | 7 — laptops, monitors, dock, keyboard |
| Software Licenses | 6 — Adobe CC, M365, Figma, GitHub, Slack, Zoom (retired) |
| Office Supplies | 4 — chairs, desks, mice, ring light |

### Alice Chen (`alice@inventoryhub.dev`) — 2 inventories, 10 assets

| Inventory | Assets |
|-----------|--------|
| Hardware *(default)* | 5 — MacBook Air, Surface Pro, monitor, iPads, Pencils |
| Peripherals | 5 — USB hub, AirPods, Sony (retired), Notion, Loom |

Asset quantities deliberately include edge cases: **0** (retired items), single-digit,
and double-digit values so charts and analytics look meaningful.

---

## Idempotency & resetting

The seeder is safe to re-run at any time:

- **Clerk users** are reused if they already exist; their password is reset each run.
- **DB data** for those users is **deleted then re-inserted** from scratch — no duplicates.
- Other users' data is never touched.

To fully reset a user's data and re-seed:

```bash
npm run seed:reset
```

(Same as `npm run seed` — included for clarity in CI scripts.)

---

## Environment gate

The script refuses to run unless one of the following is true:

| Condition | Example |
|-----------|---------|
| `NODE_ENV=development` | Set automatically by `next dev` |
| `SEED_MOCK_DATA=true` | Explicit opt-in |
| `--dev` CLI flag | Added by `npm run seed` |

This prevents accidental seeding against a production database.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing CLERK_SECRET_KEY` | Make sure `.env.local` exists and is complete |
| `Clerk POST /users → 422` | Email+password auth may be disabled in your Clerk dashboard — enable it under **User & Authentication → Email, Phone, Username** |
| `column "user_id" does not exist` | Run `npx drizzle-kit migrate` first |
| `tsx: command not found` | Run `npm install` to pick up the new `tsx` devDependency |
| Seed prints credentials but login fails | Check Clerk dashboard → **Users** to confirm the account exists; try "Reset password" there |

---

## Files

| File | Purpose |
|------|---------|
| `scripts/seed.ts` | The seeder — edit `SEED_USERS` to change what gets created |
| `src/db/schema.ts` | Drizzle schema used by the seeder |
| `drizzle/` | Migration SQL files |
| `.env.local` | Secrets (never commit) |
