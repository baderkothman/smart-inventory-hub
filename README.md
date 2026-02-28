# Smart Inventory Hub

A Next.js 16 dashboard for managing company assets (laptops, monitors, licenses) across multiple inventories, with authentication, AI-powered descriptions, analytics, and a full automated test suite.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Auth | Clerk |
| Database | Neon (Postgres) + Drizzle ORM |
| Data Grid | AG Grid Community v35 |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Testing | Vitest v4 (unit/component) + Playwright v1.58 (E2E) |
| Linting | Biome |
| Package manager | Bun |

---

## Features

### Auth & Session Management (Clerk)

- Guests can access `/`, `/sign-in/*`, `/sign-up/*`
- All other routes require a valid Clerk session (deny-by-default middleware)
- API routes return `{ "error": "Unauthorized" }` (401 JSON) instead of redirect HTML
- Sign-out redirects to `/`

**Middleware:** `src/proxy.ts`

### Multi-Inventory Support

Each user can create and manage multiple named inventories:

- Create / rename / delete inventories
- Set a default inventory
- Asset counts shown per inventory
- Dashboard filters assets by selected inventory via `?inv=<inventoryId>` URL param
- Deletion rules:
  - Cannot delete an inventory that still has assets
  - Cannot delete the last remaining inventory
  - Deleting the current default auto-promotes the next inventory

**API:** `src/app/api/inventories/`

### Asset Management

Full CRUD for assets, scoped to the authenticated user:

| Field | Description |
|-------|-------------|
| `type` | LAPTOP, MONITOR, LICENSE, or OTHER |
| `status` | IN_STOCK, ASSIGNED, or RETIRED |
| `name`, `brand`, `model`, `serialNumber` | Identification |
| `quantity` | Integer ≥ 0 |
| `imageUrl` | Optional image |
| `purchaseDate`, `warrantyEndDate` | Date fields |
| `description`, `notes` | Free text |
| `inventoryId` | Which inventory the asset belongs to |

**API:** `src/app/api/assets/`

### AI Description Generation

`POST /api/ai/asset-description` calls Gemini 2.5 Flash to generate a concise technical description from type, name, brand, model, serial number, and notes. Auth required.

### Dashboard (AG Grid)

- Inventory selector dropdown (defaults to **All inventories** view)
- Quick filter text search across all columns
- Columns: Image, Type, Name, Brand, Model, Serial, Qty, Status, Created, Actions
- Double-click a row to open the Edit dialog
- Right-click a row for a context menu (Edit / Delete)
- Pagination: 25 rows per page

### Home Page Analytics

Server-rendered stats with client-side interactive charts:

- **Stat cards**: total inventories, total items, in-stock items
- **Pie chart**: item distribution per inventory (SVG, 8-color palette)
- **Inventory table**: name, asset count, is-default badge

### Responsive Design + Dark Mode

- Mobile-first responsive layout
- Dark sidebar always-on (even in light mode)
- Light / dark toggle persisted in `localStorage` (`sih-theme` key)
- Flash-free theme init via inline script in root layout

---

## Project Structure

```
src/
  app/
    (app)/                            # Protected routes (Clerk auth required)
      _components/
        app-shell.tsx                 # Main shell: dark sidebar + top bar
        theme-toggle.tsx              # Light/dark toggle button
      home/
        page.tsx                      # Server component: stats + inventory data
        analytics-charts.tsx          # Pie chart + legend (client)
      dashboard/
        page.tsx                      # Auth wrapper (server)
        ui.tsx                        # AG Grid + all dialogs (client)
        widgets/
          add-asset-dialog.tsx
          edit-asset-dialog.tsx
          delete-asset-dialog.tsx     # Requires typing DELETE to confirm
      profile/page.tsx                # Clerk <UserProfile />
      settings/[[...rest]]/page.tsx   # Clerk <UserProfile /> (settings tab)
      layout.tsx                      # Auth gate + AppShell wrapper
    api/
      assets/route.ts                 # GET/POST assets (scoped to user)
      assets/[id]/route.ts            # GET/PATCH/DELETE single asset
      inventories/route.ts            # GET/POST inventories
      inventories/[id]/route.ts       # PATCH/DELETE single inventory
      ai/asset-description/route.ts   # POST — Gemini description generation
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
    layout.tsx                        # Root layout: ClerkProvider, fonts, theme script
    page.tsx                          # Landing page (public)
    globals.css                       # Tailwind + AG Grid theme + design tokens
  components/ui/                      # shadcn/ui components
  db/
    schema.ts                         # Drizzle schema: inventories + assets tables
    index.ts                          # Drizzle + Neon client
  lib/
    labelize.ts                       # SCREAMING_SNAKE → Title Case, option arrays
    utils.ts                          # cn() Tailwind class merger
  proxy.ts                            # Clerk middleware (auth protection)
  test/
    setup.ts                          # Vitest global setup (jsdom mocks)
    utils.tsx                         # Custom RTL render wrapper

e2e/
  landing.spec.ts                     # Landing page flows
  auth-pages.spec.ts                  # Sign-in / sign-up pages
  app-pages.spec.ts                   # Protected pages + API 401 checks

.github/workflows/
  tests.yml                           # CI: unit tests + E2E tests jobs
```

---

## Environment Variables

Create `.env.local` in the project root:

```env
# Neon Postgres
# Use pooled URL for app runtime, direct for migrations
DATABASE_URL=postgresql://...-pooler...neon.tech/...?sslmode=require
DATABASE_URL_DIRECT=postgresql://...ep-xxxx...neon.tech/...?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Google AI (Gemini)
GOOGLE_API_KEY=...
```

---

## Install & Run

```bash
bun install
bun dev          # dev server on http://localhost:3000
```

---

## Database

### Schema changes

Edit `src/db/schema.ts`, then push:

```bash
bun drizzle-kit push
```

### Migrations (for production)

```bash
bunx drizzle-kit generate   # generate SQL migration files
bunx drizzle-kit migrate    # apply migrations (uses DATABASE_URL_DIRECT)
```

### Seed data

Populate the database with realistic mock data (product images, serial numbers, purchase/warranty dates):

```bash
bun run seed
```

This wipes all existing assets and inventories, then inserts two demo users with pre-populated data. See [SEEDING.md](SEEDING.md) for credentials, customisation options, and troubleshooting.

**Demo users (defaults):**

| User | Email | Password |
|------|-------|----------|
| Jordan Rivera | admin@inventoryhub.dev | Admin@Demo2024! |
| Sophia Park | sophia@inventoryhub.dev | Sophia@Demo2024! |

---

## Testing

### Unit & Component Tests (Vitest)

```bash
bun run test          # single run
bun run test:watch    # watch mode
bun run test:ui       # Vitest UI (browser)
```

Tests live alongside source files in `__tests__/` folders and in `src/__tests__/`.

**What's covered:**
- `cn()` utility — 10 tests (class merging, Tailwind conflict resolution)
- `labelize()` + option arrays — 9 tests
- `buildPieSlices()` — 9 tests (arc math, colors, edge cases)
- Quantity clamping logic — 9 tests
- `<Button>` component — 8 tests
- `<Badge>` component — 8 tests
- `<ThemeToggle>` component — 7 tests
- Analytics charts component — 8 tests
- `<DeleteAssetDialog>` — 9 tests (confirmation flow, case-insensitive)

**Total: 77 tests**

### E2E Tests (Playwright)

```bash
bun run test:e2e
```

E2E tests run against a dev server on port 3001 with `E2E_TEST_MODE=true` — this bypasses Clerk auth so protected pages render without a real session.

**What's covered:**
- Landing page (HTTP 200, hero heading, nav links, feature text, navigation)
- Sign-in / sign-up pages (HTTP 200, URL match, non-blank body)
- Home page (no server error, heading, CTA button, stat cards)
- Dashboard page (no server error, heading)
- API routes (401 without auth for `/api/inventories` and `/api/assets`)

### Run everything

```bash
bun run test:all    # unit + E2E
```

---

## CI / GitHub Actions

`.github/workflows/tests.yml` runs on every push and pull request.

**`unit` job** (no secrets required):
- Installs Bun + dependencies
- Runs `bun run test`

**`e2e` job** (requires repository secrets):
- Installs Bun + Playwright Chromium
- Builds the Next.js app
- Runs `bun run test:e2e`
- Uploads HTML report artifact (7-day retention)

### Required secrets

Go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `DATABASE_URL` | Neon pooled connection string |

> **Note:** If you added secrets as *environment* secrets instead of repository secrets, add `environment: <your-env-name>` to the `e2e` job in `.github/workflows/tests.yml`.

---

## Security

- Sessions handled by Clerk — no session tokens stored in the database
- Clerk middleware protects all routes by default (deny-by-default)
- All DB queries are scoped by `userId` — users can only access their own data
- `E2E_TEST_MODE` bypass is a server-only env var (no `NEXT_PUBLIC_` prefix) — it cannot be set by clients and is injected only by the Playwright test runner

---

## Lint & Format

```bash
bun run lint      # Biome check
bun run format    # Biome format --write
```

---

## Further Reading

- [Architecture & File Reference](docs/architecture.md) — purpose and API of every source file
