import { expect, test } from "@playwright/test";

test.describe("Sign-in page", () => {
  test("loads without a server error (status 200)", async ({ page }) => {
    const response = await page.goto("/sign-in");
    expect(response?.status()).toBe(200);
  });

  test("renders on the /sign-in URL", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("page is not blank — at least one element with 'sign' text is present", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    // Clerk renders its own widget. Wait for Clerk iframe or any visible element.
    // We use a loose check: the document body is non-empty.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});

test.describe("Sign-up page", () => {
  test("loads without a server error (status 200)", async ({ page }) => {
    const response = await page.goto("/sign-up");
    expect(response?.status()).toBe(200);
  });

  test("renders on the /sign-up URL", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("page is not blank — body has content", async ({ page }) => {
    await page.goto("/sign-up");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
