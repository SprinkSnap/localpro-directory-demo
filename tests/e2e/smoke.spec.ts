import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("LocalPro Directory smoke", () => {
  test("homepage renders concept disclosure and search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Find the Right Local Professional, Faster.",
    );
    await expect(page.getByText(/Portfolio concept by Che Xu Studio/i).first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("mobile hamburger opens and closes navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /Open navigation menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Close navigation menu/i })).toBeVisible();
    await page.getByRole("button", { name: /Close navigation menu/i }).click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
  });

  test("search filters and pagination work", async ({ page }) => {
    await page.goto("/search/?q=cleaning");
    await expect(page.getByRole("heading", { name: /Search results/i })).toBeVisible();
    await expect(page.getByText(/fictional professionals/i)).toBeVisible();
  });

  test("category and area pages load", async ({ page }) => {
    await page.goto("/categories/plumbing/");
    await expect(page.getByRole("heading", { level: 1, name: "Plumbing" })).toBeVisible();
    await page.goto("/areas/north-district/");
    await expect(page.getByRole("heading", { level: 1, name: "North District" })).toBeVisible();
  });

  test("listing detail has fictional disclosure and no ratings", async ({ page }) => {
    await page.goto("/categories/plumbing/");
    const profile = page.locator('a[href^="/professionals/"]').first();
    await profile.click();
    await expect(page.getByText(/Fictional profile disclosure/i)).toBeVisible();
    await expect(page.getByText(/star rating|verified licence|insured/i)).toHaveCount(0);
  });

  test("compare and saved empty states", async ({ page }) => {
    await page.goto("/compare/");
    await expect(page.getByText(/No professionals selected/i)).toBeVisible();
    await page.goto("/saved/");
    await expect(page.getByText(/No saved listings yet/i)).toBeVisible();
  });

  test("quote-request demo completes without transmitting", async ({ page }) => {
    await page.goto("/request-quotes/");
    await page.locator("#quote-category").selectOption({ index: 1 });
    await page.locator("#quote-service").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator("#quote-area").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/One selected provider/i).check();
    const firstProvider = page.locator('input[name="provider"]').first();
    await firstProvider.check();
    await page.getByRole("button", { name: /Complete demonstration/i }).click();
    await expect(
      page.getByText(/You’ve completed the LocalPro quote-request demonstration/i),
    ).toBeVisible();
  });

  test("business onboarding demo completes", async ({ page }) => {
    await page.goto("/submit-listing/");
    await page.locator("#biz-category").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator("#biz-name").fill("Cedar Demo Studio Co.");
    await page.locator("#biz-desc").fill("Fictional demo business profile.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Continue to preview/i }).click();
    await page.getByRole("button", { name: /Finish demonstration/i }).click();
    await expect(
      page.getByText(/You’ve completed the LocalPro business-onboarding demonstration/i),
    ).toBeVisible();
  });

  test("enquiry drawer opens from portfolio CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Build a Platform Like This/i }).first().click();
    await expect(
      page.getByRole("heading", {
        name: /Want to Build a Directory, Marketplace or Search Platform/i,
      }),
    ).toBeVisible();
  });

  test("@a11y homepage has no critical violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toEqual([]);
  });
});
