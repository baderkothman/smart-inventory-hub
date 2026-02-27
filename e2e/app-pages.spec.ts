/**
 * E2E tests for protected app pages using E2E_TEST_MODE=true.
 *
 * The webServer in playwright.config.ts starts Next.js with E2E_TEST_MODE=true,
 * which bypasses Clerk auth so these pages render without a real session.
 * The home page will show stats (possibly 0 / empty-state) and the
 * dashboard and settings pages will render their shells.
 */
import { expect, test } from "@playwright/test";

test.describe("Home page (test mode — no auth required)", () => {
  test("loads without a server error", async ({ page }) => {
    const response = await page.goto("/home");
    // Accepts both 200 (data) and any redirect (3xx) gracefully
    expect(response?.status()).toBeLessThan(400);
  });

  test("renders the Home heading", async ({ page }) => {
    await page.goto("/home");
    // The page renders either data or the error fallback — the sidebar + heading
    // should still be visible because AppShell renders unconditionally.
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows the 'Open dashboard' CTA button", async ({ page }) => {
    await page.goto("/home");
    await expect(
      page.getByRole("link", { name: /open dashboard/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows the Quick access section", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByText("Quick access")).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Dashboard page (test mode — no auth required)", () => {
  test("loads without a server error", async ({ page }) => {
    const response = await page.goto("/dashboard");
    expect(response?.status()).toBeLessThan(400);
  });

  test("renders the Dashboard heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("API routes", () => {
  test("GET /api/inventories returns 401 when called without auth outside test mode", async ({
    request,
  }) => {
    // Direct API request does not carry E2E_TEST_MODE bypass for API auth
    // (Clerk's auth() still returns null userId), so it should be 401.
    const res = await request.get("/api/inventories");
    expect(res.status()).toBe(401);
  });

  test("GET /api/assets returns 401 when called without auth outside test mode", async ({
    request,
  }) => {
    const res = await request.get("/api/assets");
    expect(res.status()).toBe(401);
  });
});
