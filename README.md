# Smart Inventory Hub

A Next.js dashboard to manage company assets (laptops, monitors, licenses) with:

- **Fast grid UI** (AG Grid Community)
- **Authentication & sessions** (Clerk)
- **Postgres** on **Neon**
- **ORM + migrations** (Drizzle)
- **AI description generation** (Gemini via Google AI SDK) — wired via an API route

---

## Stack (Strict Requirements)

- **Next.js 16 (App Router) + TypeScript**
- **Neon (Postgres) + Drizzle ORM**
- **Clerk Authentication**
- **Google AI SDK (Gemini)** for description generation
- **Tailwind CSS v4 + shadcn/ui**
- **AG Grid (Community)**
- **Bun** (package manager)
- **Biome** (lint/format)

---

## What’s Implemented So Far

### 1) Auth + Session Enforcement (Clerk)

- Guests can access:
  - `/`
  - `/sign-in/*`
  - `/sign-up/*`
- Everything else (e.g. `/dashboard`) requires a valid Clerk session.
- API routes return **401 JSON** instead of redirect HTML (prevents client `res.json()` crashes).

**Middleware:** `src/proxy.ts`

- Deny-by-default (everything protected except public routes).
- If request is `/api/*` (or `/trpc/*`) and user is not authenticated → returns:
  ```json
  { "error": "Unauthorized" }
  ```

### 2) Two “Home” Experiences

- `src/app/page.tsx`:
  - If **signed in** → redirect to `/dashboard`
  - If **guest** → landing page with Sign in / Sign up

### 3) Sign-out returns to Home

- `src/app/layout.tsx` sets:
  - `afterSignOutUrl="/"`

Dashboard includes a sign-out control (Clerk) that redirects to `/`.

### 4) Database Authorization Scoping

We do **NOT** store session tokens in our DB (Clerk handles sessions).
We store **ownership** on assets so each user can only access their own inventory.

**Schema:** `src/db/schema.ts`

- `assets.createdByUserId` (required)
- Enums:
  - `asset_type`: `LAPTOP | MONITOR | LICENSE | OTHER`
  - `asset_status`: `IN_STOCK | ASSIGNED | RETIRED`

### 5) Assets API

**List + Create:** `src/app/api/assets/route.ts`

- `GET /api/assets` → returns only assets owned by the signed-in user
- `POST /api/assets` → creates an asset owned by the signed-in user

**Update + Delete (per-asset):** `src/app/api/assets/[id]/route.ts`

- `PATCH /api/assets/:id`
- `DELETE /api/assets/:id`
- Both enforce:
  - `WHERE id = :id AND created_by_user_id = :userId`

### 6) Dashboard UI (AG Grid) + CRUD dialogs

**Dashboard page:** `src/app/dashboard/page.tsx` → renders `<DashboardClient />`

**Dashboard UI:** `src/app/dashboard/ui.tsx`

- Loads assets via `/api/assets`
- Quick search using AG Grid **Quick Filter**
- Uses **AG Grid legacy theme mode**:
  - `theme="legacy"` to avoid theme conflict error #239
- CRUD actions:
  - Add: `AddAssetDialog`
  - Edit: `EditAssetDialog`
  - Delete: `DeleteAssetDialog`
- Updates UI state instantly after create/update/delete (no full refresh required).

---

## Project Structure (Key Files)

```
src/
  app/
    api/
      assets/
        route.ts                # GET/POST assets (scoped to user)
        [id]/
          route.ts              # PATCH/DELETE assets/:id (scoped to user)
      ai/
        asset-description/
          route.ts              # AI description endpoint
    dashboard/
      page.tsx                  # Dashboard route
      ui.tsx                    # AG Grid + dialogs + fetch
      widgets/
        add-asset-dialog.tsx
        edit-asset-dialog.tsx
        delete-asset-dialog.tsx
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
    layout.tsx                  # ClerkProvider config + afterSignOutUrl
    page.tsx                    # Guest landing + signed-in redirect
    globals.css                 # Tailwind + AG Grid CSS (legacy theme)
  db/
    index.ts                    # Drizzle DB client
    schema.ts                   # assets table + enums
proxy.ts                        # Clerk middleware protection
drizzle.config.ts               # drizzle-kit config (migrations)
```

---

## Environment Variables

Create `./.env.local`:

### Database (Neon)

Recommended split:

- **Pooled** URL for app runtime
- **Direct** URL for migrations/tools

```env
DATABASE_URL=postgresql://...-pooler...neon.tech/...?...sslmode=require
DATABASE_URL_DIRECT=postgresql://...ep-xxxx...neon.tech/...?...sslmode=require
```

### Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Gemini / Google AI SDK

(Depends on your current `src/app/api/ai/asset-description/route.ts` implementation.)

```env
GOOGLE_API_KEY=...
```

---

## Install & Run (Bun)

```bash
bun install
bun dev
```

---

## Migrations (Drizzle)

Generate migrations from schema:

```bash
bunx drizzle-kit generate
```

Apply migrations (use `DATABASE_URL_DIRECT` through `drizzle.config.ts`):

```bash
bunx drizzle-kit migrate
```

---

## Migrating from Local Postgres (pgAdmin) to Neon (Optional)

If you’re moving existing data, use `pg_dump` / `pg_restore`.

Important:

- Use **DIRECT** Neon host for dumps/restores (avoid `-pooler` for `pg_restore`).

Restore example (Windows PowerShell):

```powershell
$env:PGPASSWORD="YOUR_NEON_PASSWORD"
pg_restore --no-owner --no-privileges -v `
  -h ep-xxxx.eu-central-1.aws.neon.tech `
  -U neondb_owner -d neondb backup.dump
```

If you need to wipe target objects first:

```powershell
pg_restore --clean --if-exists --no-owner --no-privileges -v `
  -h ep-xxxx.eu-central-1.aws.neon.tech `
  -U neondb_owner -d neondb backup.dump
```

---

## Security Notes

- Sessions are handled by **Clerk** (cookies/tokens). We don’t store session tokens in our DB.
- Data security is enforced by:
  - Clerk middleware protecting pages & APIs
  - DB-level scoping with `createdByUserId` in every query for assets

---

## Current Configuration Notes

- AG Grid uses **legacy theme mode** to match CSS theme imports:
  - Keep `ag-grid.css` / quartz theme CSS in `globals.css`
  - Use `<AgGridReact theme="legacy" />`

---

## Next Steps (Suggested)

1. Add **Organizations** (Clerk Orgs) for shared company inventory
   - Add `orgId` to `assets`
   - Filter by `orgId` instead of `createdByUserId`
2. Add **audit logging**
   - Track who created/updated/deleted assets
3. Add **rate limiting** for `/api/ai/asset-description`
4. Add better form UX (toasts, inline validation errors)
5. Add advanced grid features:
   - Column state persistence
   - Export CSV
   - Bulk actions
