import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads without a server error", async ({ page }) => {
    // The page should return HTTP 200
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("renders the main hero heading", async ({ page }) => {
    // The h1 contains "Manage assets" — exact wording is stable product copy
    await expect(
      page.locator("h1").filter({ hasText: "Manage assets" }),
    ).toBeVisible();
  });

  test("has a Sign in navigation link", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("has a Sign up navigation link in the header", async ({ page }) => {
    // There may be multiple Sign up links (nav + hero CTA)
    await expect(
      page.getByRole("link", { name: "Sign up" }).first(),
    ).toBeVisible();
  });

  test("clicking Sign in navigates to /sign-in", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("clicking Sign up navigates to /sign-up", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).first().click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("shows key feature text", async ({ page }) => {
    await expect(page.getByText("Fast grid")).toBeVisible();
    await expect(page.getByText("AI descriptions")).toBeVisible();
  });
});
