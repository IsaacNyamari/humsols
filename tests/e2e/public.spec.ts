import { expect, test, type Page } from "@playwright/test";

async function fillContact(page: Page, prefix = "") {
  const id = (name: string) => `#${prefix ? `${prefix}--` : ""}${name}`;
  await page.locator(id("name")).fill("Wanjiku Test");
  await page.locator(id("phone")).fill("+254 700 111 222");
  await page.locator(id("email")).fill("wanjiku@example.test");
  await page.locator(id("consent")).check();
}

test.describe("home page", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`renders with the logo in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("We build the systems");
      const header = page.locator("header");
      const visibleLogo = header.locator('img[alt="Human Solutions"]:visible');
      await expect(visibleLogo).toHaveCount(1);
      await expect(visibleLogo).toHaveAttribute(
        "src",
        scheme === "dark" ? /humsols-logo-dark/ : /humsols-logo\.png/,
      );
      await expect(page.getByRole("heading", { name: "Six services, one team" })).toBeVisible();
    });
  }

  test("theme toggle switches and remembers the theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByTestId("theme-toggle").first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test("contact form shows a success reference", async ({ page }) => {
  await page.goto("/contact");
  await fillContact(page);
  await page.locator("#message").fill("Hello, I would like a quote for a company website.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByTestId("lead-reference")).toHaveText(/^HS-C-\d{4}-\d{4}$/);
});

test("contact form shows accessible errors", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Please accept the privacy notice")).toBeVisible();
});

test("multi-step quote for CCTV", async ({ page }) => {
  await page.goto("/quote");
  await page
    .locator("main label:visible", { has: page.getByTestId("quote-service-cctv-installation") })
    .click();
  await page.locator("[data-testid=quote-next]:visible").click();

  await page.locator("[data-testid=quote-cctv-cameras]:visible").fill("8");
  await page.locator("[data-testid=quote-cctv-location]:visible").fill("Westlands, near Sarit");
  await page.locator("[data-testid=quote-next]:visible").click();

  await fillContact(page);
  await page.locator("[data-testid=quote-next]:visible").click();

  await expect(page.getByTestId("quote-review")).toContainText("CCTV installation");
  await expect(page.getByTestId("quote-review")).toContainText("8");
  await page.locator("[data-testid=quote-submit]:visible").click();
  await expect(page.getByTestId("lead-reference")).toHaveText(/^HS-Q-\d{4}-\d{4}$/);
});

test("internet coverage request", async ({ page }) => {
  await page.goto("/internet");
  const form = page.getByTestId("coverage-form");
  await form.locator("#cov--area").fill("Kileleshwa");
  await form.locator("#cov--address").fill("Othaya Road, near the shopping centre");
  await fillContact(page, "cov");
  await form.getByRole("button", { name: "Check coverage" }).click();
  await expect(page.getByTestId("lead-reference")).toHaveText(/^HS-IC-\d{4}-\d{4}$/);
});
