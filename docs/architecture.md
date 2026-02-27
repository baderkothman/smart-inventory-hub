# Architecture & File Reference

File-by-file documentation for Smart Inventory Hub. Files are grouped by directory and ordered from outermost (config) to innermost (feature code).

---

## Root Config Files

### `package.json`

Defines all dependencies and npm scripts.

**Key scripts:**

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Development server (port 3000) |
| `build` | `next build` | Production build |
| `lint` | `biome check` | Lint all files |
| `format` | `biome check --write` | Auto-format |
| `seed` | `tsx scripts/seed.ts` | Populate DB with sample data |
| `test` | `vitest run` | Run all unit/component tests once |
| `test:watch` | `vitest` | Watch mode |
| `test:ui` | `vitest --ui` | Vitest browser UI |
| `test:e2e` | `playwright test` | Run E2E tests |
| `test:all` | `bun run test && bun run test:e2e` | Run everything |

---

### `next.config.ts`

Next.js configuration. Allows external image hosts (e.g., for asset `imageUrl` values pointing to remote URLs).

---

### `tsconfig.json`

TypeScript config with path alias `@` → `./src`. All source imports use `@/...`.

---

### `tailwind.config.ts`

Tailwind v4 config. Content paths include `src/**/*.{ts,tsx}`.

---

### `biome.json`

Biome linter + formatter config (replaces ESLint + Prettier). Enforces consistent code style across the project.

---

### `components.json`

shadcn/ui config. Defines:
- Style: `new-york`
- Base color: `neutral`
- CSS variables: enabled
- Path aliases for components and utilities

---

### `drizzle.config.ts`

Drizzle Kit configuration for schema management and migrations.

- **Schema file:** `src/db/schema.ts`
- **Output dir:** `drizzle/` (migration SQL files + snapshots)
- **Dialect:** PostgreSQL
- **Credentials:** Prefers `DATABASE_URL_DIRECT` (non-pooled) for migrations; falls back to `DATABASE_URL`
- Loads env from `.env.local` via `dotenv`

---

### `vitest.config.ts`

Vitest unit/component test configuration.

- **Environment:** `jsdom` (simulates browser DOM)
- **Setup file:** `src/test/setup.ts` (runs before every test file)
- **Globals:** enabled (`describe`, `it`, `expect`, `vi` available without imports)
- **Path alias:** `@` → `./src` (matches tsconfig)
- **Excluded patterns:** `**/e2e/**`, `**/*.spec.ts` (Playwright files stay out)

---

### `playwright.config.ts`

Playwright E2E test configuration.

- **Test dir:** `./e2e`
- **Base URL:** `http://localhost:3001`
- **Browser:** Chromium only (Desktop Chrome)
- **Parallelism:** Fully parallel locally; 1 worker in CI
- **Retries:** 2 in CI, 0 locally
- **Reporter:** `github` in CI, `html` locally
- **Screenshots:** On failure only
- **Trace:** On first retry

**Web server block:**
```typescript
webServer: {
  command: "bun dev --port 3001",
  url: "http://localhost:3001",
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
  env: { E2E_TEST_MODE: "true" },   // ← injects auth bypass
}
```

The web server is started automatically before tests run. `E2E_TEST_MODE=true` is injected here and nowhere else — this is what disables Clerk auth for the test session.

---

## `src/proxy.ts` — Clerk Middleware

**Type:** Next.js middleware (runs on every request at the Edge)

**Purpose:** Protects all routes by default. Unauthenticated requests to non-public routes are blocked.

**Public routes:** `/`, `/sign-in(.*)`, `/sign-up(.*)`

**Logic:**
1. If `E2E_TEST_MODE=true` → return immediately (allow all requests through for E2E testing)
2. If request is not a public route → call `auth.protect()` which redirects to sign-in or returns 401

**Export:** Default export is `clerkMiddleware(...)`. The `config.matcher` excludes Next.js internals and static files.

> The `E2E_TEST_MODE` bypass is safe in production because it is a server-only env var (no `NEXT_PUBLIC_` prefix) that is never set outside the Playwright test runner.

---

## `src/db/`

### `src/db/index.ts` — Database Client

Exports a single `db` instance used by all API routes.

```typescript
const sql = neon(process.env.DATABASE_URL!);  // Neon serverless HTTP driver
export const db = drizzle(sql);               // Drizzle ORM instance
```

Uses the Neon HTTP driver (not WebSocket) — compatible with Next.js serverless functions.

---

### `src/db/schema.ts` — Database Schema

Defines all tables and enums using Drizzle's schema builder.

#### Enums

```typescript
assetTypeEnum   // "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER"
assetStatusEnum // "IN_STOCK" | "ASSIGNED" | "RETIRED"
```

#### `inventories` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `userId` | text | Clerk user ID, NOT NULL |
| `name` | text | Display name, NOT NULL |
| `isDefault` | boolean | Default false |
| `createdAt` | timestamp (TZ) | Auto-set on insert |
| `updatedAt` | timestamp (TZ) | Auto-updated |

Index: `inventories_user_id_idx` on `userId`

#### `assets` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `createdByUserId` | text | Clerk user ID, NOT NULL |
| `inventoryId` | UUID | FK → inventories.id, NOT NULL |
| `type` | assetTypeEnum | NOT NULL |
| `status` | assetStatusEnum | Default IN_STOCK |
| `name` | text | Optional |
| `brand` | text | Optional |
| `model` | text | Optional |
| `serialNumber` | text | Optional |
| `imageUrl` | text | Optional |
| `assignedToUserId` | text | Optional |
| `quantity` | int | Default 0 |
| `purchaseDate` | date | Optional |
| `warrantyEndDate` | date | Optional |
| `description` | text | Optional |
| `notes` | text | Optional |
| `createdAt` | timestamp (TZ) | Auto-set |
| `updatedAt` | timestamp (TZ) | Auto-updated |

Indexes: `assets_created_by_idx` on `createdByUserId`, `assets_inventory_id_idx` on `inventoryId`

---

## `src/lib/`

### `src/lib/utils.ts` — Tailwind Class Merger

```typescript
export function cn(...inputs: ClassValue[]): string
```

Combines `clsx` (conditional classes, arrays, objects) with `tailwind-merge` (removes conflicting Tailwind classes). Used in every component for dynamic className building.

**Example:**
```typescript
cn("px-4 px-6")         // → "px-6"   (conflict resolved)
cn("text-red", isError && "text-red-500")  // conditional
```

---

### `src/lib/labelize.ts` — Enum Label Converter

Converts `SCREAMING_SNAKE_CASE` database enum values to human-readable `Title Case` labels.

**Exports:**

```typescript
export function labelize(value: string): string
// "IN_STOCK" → "In Stock"
// "LAPTOP"   → "Laptop"

export const ASSET_TYPE_OPTIONS: readonly string[]
// ["LAPTOP", "MONITOR", "LICENSE", "OTHER"]

export const ASSET_STATUS_OPTIONS: readonly string[]
// ["IN_STOCK", "ASSIGNED", "RETIRED"]

export type AssetType   // union of ASSET_TYPE_OPTIONS values
export type AssetStatus // union of ASSET_STATUS_OPTIONS values
```

Used in dialogs (Add/Edit), the API response formatter, and the AG Grid type/status cell renderers.

---

## `src/app/` — Next.js App Router

### `src/app/layout.tsx` — Root Layout

**Type:** Server component

The outermost layout wrapping the entire app. Renders once per navigation session.

**Responsibilities:**
- Wraps everything in `<ClerkProvider afterSignOutUrl="/">`
- Loads fonts via `next/font/google`:
  - **Syne** → `--font-syne` (headings, logo)
  - **DM Sans** → `--font-dm-sans` (body)
- Injects an inline `<script>` in `<head>` that reads `localStorage['sih-theme']` (or `prefers-color-scheme`) and sets/removes the `dark` class on `<html>` before the page renders — prevents flash of wrong theme
- Sets `lang="en"` and applies both font CSS variables to `<html>`

---

### `src/app/page.tsx` — Landing Page

**Type:** Server component (public route)

Shown to guests. If the user is signed in (Clerk `auth()` returns a `userId`), redirects to `/home`.

**Sections:**
1. Navigation bar (logo, Sign in / Sign up links)
2. Hero (h1 heading, subheading, two CTA buttons)
3. Feature highlights (Fast grid, AI descriptions)
4. Footer

All text and layout are static — no data fetching.

---

### `src/app/sign-in/[[...sign-in]]/page.tsx`
### `src/app/sign-up/[[...sign-up]]/page.tsx`

Thin wrappers that render `<SignIn />` and `<SignUp />` from `@clerk/nextjs`. The catch-all route segment (`[[...sign-in]]`) lets Clerk handle multi-step flows at sub-paths like `/sign-in/factor-one`.

---

### `src/app/globals.css` — Global Styles & Design Tokens

Tailwind v4 entry point. Defines the entire design system via CSS custom properties.

**Key tokens (light mode):**
```css
--background:   oklch(0.974 0.006 264)   /* cool off-white */
--foreground:   oklch(0.148 0.022 264)   /* deep navy */
--primary:      oklch(0.538 0.228 290)   /* violet/indigo */
--radius:       8px
```

**Dark mode overrides:** Swapped to near-black navy backgrounds and lighter primary.

**AG Grid theme overrides:** `ag-theme-quartz` CSS variables are mapped to the same design tokens so the grid matches the app's color scheme in both light and dark mode.

**Animations:**
- `fade-up` keyframes with staggered `.animate-fade-up-{1..5}` classes (landing page entrance)
- `shimmer` keyframes (stat card loading shimmer)

---

## `src/app/(app)/` — Protected Routes

All routes inside `(app)/` require a valid Clerk session. The route group itself does not affect the URL — `/home` and `/dashboard` are the actual paths.

### `src/app/(app)/layout.tsx` — Auth Gate

**Type:** Server component

Runs before any protected page renders.

**Logic:**
1. Skip auth check if `E2E_TEST_MODE=true` (Playwright testing)
2. Call `auth()` from `@clerk/nextjs/server`
3. If no `userId` → `redirect("/sign-in")`
4. Render `<AppShell>{children}</AppShell>`

---

### `src/app/(app)/_components/app-shell.tsx` — Application Shell

**Type:** Client component

The main chrome of the app: dark sidebar + top bar + scrollable content area.

**Sidebar:**
- Always dark (`background: #060810`)
- Logo: "SI" text in a gradient badge (Syne font)
- Navigation links: Home, Dashboard, Profile, Settings
  - Active link detection via `usePathname()`
  - Active styles: `rgba(124,58,237,0.10)` background, `#C4B5FD` text, 3px left violet pill
- User card at bottom: avatar initials, display name, email, ellipsis menu (Profile, Settings, Sign out)

**Top bar:**
- Sticky, blurred background
- Mobile: hamburger button that opens sidebar as sheet
- Displays current page title based on pathname

**Theme management:**
- Reads `localStorage['sih-theme']` on mount
- Toggle writes to `localStorage` and sets/removes `dark` class on `document.documentElement`
- Listens to `storage` events to sync across tabs

---

### `src/app/(app)/_components/theme-toggle.tsx` — Theme Toggle Button

**Type:** Client component (small, leaf)

Renders a Sun/Moon icon button. Calls a `onToggle` prop (provided by AppShell). Also used standalone in various locations.

---

### `src/app/(app)/home/page.tsx` — Home Page

**Type:** Server component

Fetches all analytics data server-side and passes it to client components.

**Data fetched:**
1. Current user from Clerk (`currentUser()`)
2. User's inventories with a joined count of assets per inventory
3. Total in-stock asset count

**Rendered sections:**
1. **Greeting header** — "Good morning/afternoon/evening, {firstName}"
2. **Stat cards** (3):
   - Inventories — count with violet palette
   - Total Items — sum of all quantities with emerald palette
   - In Stock — in-stock count with amber palette
3. **`<InventoryPieChart />`** — passes `InventoryStat[]` to the chart client component
4. **Quick access** — links to Dashboard, Profile, Settings

If `userId` is null (E2E test mode), skips all DB queries and renders empty/zero state.

---

### `src/app/(app)/home/analytics-charts.tsx` — Pie Chart

**Type:** Client component

**Exports:**
- `InventoryStat` type — `{ id, name, isDefault, assetCount }`
- `buildPieSlices(stats: InventoryStat[])` — pure function, exported for unit testing
- `InventoryPieChart` — default export, the full chart component

**`buildPieSlices()` algorithm:**
1. Filters out inventories with 0 assets
2. If only 1 inventory → returns a full circle (special SVG arc case)
3. Calculates cumulative angle offsets for each slice
4. Uses `Math.PI` and trigonometry to produce SVG `M ... A ... Z` path strings
5. Returns slices with: `path`, `color` (8-color rotating palette), `percent`, `assetCount`, `name`

**Color palette:** violet, emerald, amber, blue, red, purple, cyan, yellow (oklch values)

**Chart rendering:** 100×100 SVG viewBox, each slice is a `<path>` with a hover scale transform.

---

### `src/app/(app)/home/theme-toggle-menu-item.tsx`

Thin wrapper that renders the theme toggle as a dropdown menu item, used inside AppShell's user card menu.

---

### `src/app/(app)/dashboard/page.tsx` — Dashboard Page (Server)

**Type:** Server component

Thin wrapper: checks auth (same pattern as `(app)/layout.tsx`), then renders `<DashboardClient />` (the actual client component in `ui.tsx`). Separates server-only auth logic from client-heavy grid UI.

---

### `src/app/(app)/dashboard/ui.tsx` — Dashboard Client

**Type:** Client component (~600 lines)

The main feature component. Manages all state for inventories and assets.

**State:**
- `inventories: Inventory[]` — user's inventory list
- `selectedInventoryId: string | null` — controls which inventory's assets are shown
- `rows: AssetRow[]` — current AG Grid rows
- Various `boolean` states for each dialog (add asset, edit asset, delete asset, create inventory, rename inventory, delete inventory)
- `editingAsset: AssetRow | null`, `deletingAsset: AssetRow | null`

**Inventory operations:**
- Load on mount, reload after mutations
- Create: `POST /api/inventories`
- Rename: `PATCH /api/inventories/{id}` with `{ name }`
- Set default: `PATCH /api/inventories/{id}` with `{ isDefault: true }`
- Delete: `DELETE /api/inventories/{id}` (with client-side guard for non-empty / last inventory)

**Asset operations:**
- Load when `selectedInventoryId` changes
- Add → `POST /api/assets` → prepend to rows
- Edit → `PATCH /api/assets/{id}` → replace row in place
- Delete → `DELETE /api/assets/{id}` → remove from rows

**AG Grid setup:**
- `columnDefs`: image, type, name, brand, model, serial, quantity, status, createdAt, actions
- `ImageCell`: renders `<img>` with `object-cover` or falls back to initials in a colored circle
- `RowMenuCell`: `DropdownMenu` with Edit and Delete items
- `quickFilterText` wired to a search input
- `pagination: true`, `paginationPageSize: 25`
- `onRowDoubleClicked`: opens Edit dialog

**Helper functions (module-private):**
- `fetchJson<T>(url, opts)` — fetch with JSON headers, throws on non-ok
- `formatDate(iso)` — ISO string → localized `"Jan 15, 2024, 3:30 PM"`
- `getInitials(name)` — `"MacBook Pro"` → `"MP"`

---

### `src/app/(app)/dashboard/widgets/add-asset-dialog.tsx`

**Type:** Client component

Dialog for creating a new asset. Fields: inventory selector, type (select), name, brand, model, serial, quantity, status, image URL, purchase date, warranty end date, description.

On submit: `POST /api/assets` → calls `onCreated(newAsset)` prop to update parent state.

Includes an "AI Description" button that calls `POST /api/ai/asset-description` and fills the description textarea.

---

### `src/app/(app)/dashboard/widgets/edit-asset-dialog.tsx`

**Type:** Client component

Same fields as Add dialog but pre-populated from the selected `AssetRow`. On submit: `PATCH /api/assets/{id}` with only changed fields. Calls `onUpdated(updatedAsset)`.

---

### `src/app/(app)/dashboard/widgets/delete-asset-dialog.tsx`

**Type:** Client component

Destructive confirmation dialog. Shows the asset name. Requires the user to type `DELETE` (case-insensitive — comparison uses `.toUpperCase()`) before the Delete button becomes enabled.

On confirm: `DELETE /api/assets/{id}` → calls `onDeleted(id)`.

---

### `src/app/(app)/profile/page.tsx`

Renders Clerk's `<UserProfile />` component for account management (name, email, password, connected accounts).

---

### `src/app/(app)/settings/[[...rest]]/page.tsx`

Also renders `<UserProfile />` but opened on a specific settings tab. The catch-all segment allows Clerk's internal routing to work.

---

## `src/app/api/` — API Routes

All API routes use `export const runtime = "nodejs"` (not Edge) to access the Neon database client.

Auth pattern used in every route:
```typescript
const { userId } = await auth();
if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

---

### `src/app/api/inventories/route.ts`

**GET `/api/inventories`**
- Returns all inventories for the authenticated user
- Sorted: default inventory first, then by `createdAt` ASC
- Response fields: `id`, `name`, `isDefault`, `createdAt`, `updatedAt`

**POST `/api/inventories`**
- Creates a new inventory for the user
- Body: `{ name: string }`
- Validates: name must be non-empty after trimming
- Returns created inventory (201)

---

### `src/app/api/inventories/[id]/route.ts`

**PATCH `/api/inventories/:id`**

Two modes depending on body:

- **Rename:** `{ name: string }` — trims, validates non-empty, updates name
- **Set default:** `{ isDefault: true }` — runs two queries in sequence:
  1. `UPDATE inventories SET is_default = false WHERE user_id = :userId`
  2. `UPDATE inventories SET is_default = true WHERE id = :id AND user_id = :userId`

Ownership is always verified (userId must match).

**DELETE `/api/inventories/:id`**

Guards:
1. Inventory must exist and belong to the user
2. Inventory must have 0 assets (cannot delete non-empty)
3. User must have at least 2 inventories (cannot delete the last one)
4. If deleting the current default → promotes the next inventory to default

Returns `{ id }` of the deleted inventory.

---

### `src/app/api/assets/route.ts`

**GET `/api/assets`**
- Returns assets for the authenticated user
- Accepts optional `?inventoryId=<uuid>` query param to filter by inventory
- Sorted by `createdAt` DESC
- Dates normalized to ISO strings

**POST `/api/assets`**
- Required body fields: `type`, `name`, `inventoryId`
- Verifies the `inventoryId` belongs to the user before creating
- Optional fields: `brand`, `model`, `serialNumber`, `imageUrl`, `status`, `quantity`, `purchaseDate`, `warrantyEndDate`, `description`, `notes`
- `quantity` is clamped to a non-negative integer: `Math.max(0, Math.floor(quantity))`
- Returns created asset (201)

---

### `src/app/api/assets/[id]/route.ts`

**GET `/api/assets/:id`**
- Returns a single asset (ownership verified)

**PATCH `/api/assets/:id`**
- Partial update — only fields present in the body are updated
- Supported fields: `type`, `status`, `name`, `brand`, `model`, `serialNumber`, `imageUrl`, `notes`, `description`, `quantity`
- String fields are trimmed before saving
- `quantity` clamped to non-negative integer
- `updatedAt` always set to `new Date()`

**DELETE `/api/assets/:id`**
- Deletes asset (ownership verified via `WHERE id = :id AND created_by_user_id = :userId`)

---

### `src/app/api/ai/asset-description/route.ts`

**POST `/api/ai/asset-description`**

Generates a concise technical description using Google Gemini 2.5 Flash.

**Body:** `{ type, name, brand?, model?, serialNumber?, notes? }`

**Prompt pattern:**
> "Write a concise, technical description for an asset of type {type}: {name} by {brand}, model {model}. Serial: {serialNumber}. Notes: {notes}. One paragraph, plain text."

**Response:** `{ description: string }`

Auth required. Uses `GOOGLE_API_KEY` env var.

---

## `src/components/ui/` — shadcn/ui Components

Pre-built Radix UI + Tailwind components. These are generated by shadcn and customized to match the design system.

| File | Radix UI primitive | Notes |
|------|--------------------|-------|
| `button.tsx` | — | `variant` prop: default, destructive, outline, ghost, link |
| `badge.tsx` | — | `variant` prop: default, secondary, destructive, outline |
| `dialog.tsx` | `@radix-ui/react-dialog` | DialogContent portals to `document.body` |
| `dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu` | Used for row actions, user card menu |
| `input.tsx` | — | Base text input |
| `label.tsx` | `@radix-ui/react-label` | Accessible form labels |
| `select.tsx` | `@radix-ui/react-select` | Used for type/status/inventory dropdowns |
| `textarea.tsx` | — | Used for description/notes |

---

## `src/test/`

### `src/test/setup.ts` — Vitest Global Setup

Runs before every test file. Registers global mocks required for browser APIs that jsdom doesn't implement:

- **`@testing-library/jest-dom`** — custom matchers (`toBeInTheDocument`, `toBeDisabled`, etc.)
- **`ResizeObserver`** — mocked with `vi.fn()` (AG Grid and Radix UI use it)
- **`window.matchMedia`** — mocked (Radix UI checks media queries)
- **`HTMLElement.prototype.scrollIntoView`** — no-op (Radix UI scroll-into-view)
- **Pointer capture methods** — `hasPointerCapture`, `setPointerCapture`, `releasePointerCapture` (Radix UI sliders/select)
- **`URL.createObjectURL`** — no-op

### `src/test/utils.tsx` — Custom Render Wrapper

Re-exports everything from `@testing-library/react` and overrides `render` with a custom wrapper that provides any necessary React context (currently minimal — just wraps children in a fragment).

---

## `e2e/` — Playwright E2E Tests

All tests run against the Next.js dev server with `E2E_TEST_MODE=true`.

### `e2e/landing.spec.ts`

Tests the public landing page at `/`.

| Test | What it checks |
|------|---------------|
| loads without a server error | `response.status() === 200` |
| renders the main hero heading | `h1` containing "Manage assets" is visible |
| has a Sign in navigation link | `<a>Sign in</a>` in nav is visible |
| has a Sign up navigation link in the header | First `<a>Sign up</a>` is visible |
| clicking Sign in navigates to /sign-in | URL matches `/\/sign-in/` after click |
| clicking Sign up navigates to /sign-up | URL matches `/\/sign-up/` after click |
| shows key feature text | "Fast grid" and "AI descriptions" text visible |

---

### `e2e/auth-pages.spec.ts`

Tests the Clerk-rendered authentication pages.

| Test | Page | What it checks |
|------|------|---------------|
| loads without a server error | /sign-in | status 200 |
| renders on the /sign-in URL | /sign-in | URL matches `/\/sign-in/` |
| page is not blank | /sign-in | `body.innerText.length > 0` |
| loads without a server error | /sign-up | status 200 |
| renders on the /sign-up URL | /sign-up | URL matches `/\/sign-up/` |
| page is not blank | /sign-up | `body.innerText.length > 0` |

---

### `e2e/app-pages.spec.ts`

Tests protected app pages (using `E2E_TEST_MODE=true` to bypass auth) and verifies API auth.

| Test | What it checks |
|------|---------------|
| Home — loads without a server error | `response.status() < 400` |
| Home — renders the Home heading | `<h2>Home</h2>` visible |
| Home — shows 'Open dashboard' CTA button | link matching `/open dashboard/i` visible |
| Home — shows the Quick access section | "Quick access" text visible |
| Dashboard — loads without a server error | `response.status() < 400` |
| Dashboard — renders the Dashboard heading | `<h2>Dashboard</h2>` visible |
| API `/api/inventories` — returns 401 without auth | Direct API request (no E2E bypass) returns 401 |
| API `/api/assets` — returns 401 without auth | Direct API request (no E2E bypass) returns 401 |

> The API 401 tests use `request.get()` directly, which does not carry the `E2E_TEST_MODE` header. The API routes check Clerk `auth()` independently, so they return 401 as expected.

---

## `.github/workflows/tests.yml` — CI Pipeline

Runs on every push and pull request to any branch.

### Job: `unit`

```yaml
runs-on: ubuntu-latest
```

Steps:
1. Checkout code
2. Setup Bun (latest)
3. Cache Bun dependencies (`~/.bun/install/cache` keyed on `bun.lock` hash)
4. `bun install --frozen-lockfile`
5. `bun run test`

No secrets required. Tests ~77 cases in a few seconds.

### Job: `e2e`

```yaml
runs-on: ubuntu-latest
timeout-minutes: 15
```

**Required secrets** (set as repository secrets in GitHub):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`

Steps:
1. Checkout code
2. Setup Bun
3. Cache Bun dependencies
4. `bun install --frozen-lockfile`
5. `bunx playwright install --with-deps chromium` (installs browser + OS deps)
6. `bun run build` (production build for reliability)
7. `bun run test:e2e`
8. Upload `playwright-report/` as an artifact (7-day retention, always runs)

> If you added secrets as *environment secrets* (not *repository secrets*), the `e2e` job must include `environment: <your-environment-name>` to access them.

---

## `drizzle/` — Migration Artifacts

Auto-generated by `bunx drizzle-kit generate`. Contains:
- SQL migration files (numbered: `0000_...sql`, `0001_...sql`, etc.)
- `meta/` — JSON snapshots of schema state at each migration step + `_journal.json`

Do not edit these files by hand. To apply migrations: `bunx drizzle-kit migrate`.

---

## `scripts/seed.ts` — Database Seeder

Populates the database with sample inventories and assets for development. Run with `bun run seed`.

> See `SEEDING.md` for details on the seed data structure and how to reset the database.

---

## Design System Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `oklch(0.538 0.228 290)` | Buttons, active states, links |
| Background | `oklch(0.974 0.006 264)` (light) | Page background |
| Background | `oklch(0.088 0.018 264)` (dark) | Page background |
| Sidebar bg | `#060810` | Always dark |
| Active nav bg | `rgba(124,58,237,0.10)` | Sidebar active item |
| Active nav text | `#C4B5FD` | Sidebar active text |
| Active nav pill | `#A78BFA` | Left border indicator |
| Radius | `8px` | All rounded corners |
| Heading font | Syne | Logo, headings |
| Body font | DM Sans | All body text |
