import { expect, test, type Page } from "@playwright/test";
import { E2E_USERS } from "./fixtures";

async function login(page: Page, who: keyof typeof E2E_USERS) {
  const user = E2E_USERS[who];
  await page.goto("/admin/login");
  await page.locator("form:visible #email").fill(user.email);
  await page.locator("form:visible #password").fill(user.password);
  await page.locator("form:visible").getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("signed-out visitors are sent to the login page", async ({ page }) => {
  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin sees a new lead, changes its status and adds a note", async ({ page, request }) => {
  // Create a lead through the public API.
  const res = await request.post("/api/leads", {
    headers: { Origin: "http://localhost:3100" },
    data: {
      type: "support",
      name: "Lead For Admin",
      email: "lead-admin@example.test",
      phone: "+254 700 333 444",
      consent: true,
      message: "Our CCTV recorder stopped recording last night.",
      details: { category: "cctv", priority: "high" },
    },
  });
  expect(res.status()).toBe(201);
  const { reference } = (await res.json()) as { reference: string };

  await login(page, "owner");
  await page.goto("/admin/leads");
  await page.getByRole("link", { name: reference }).click();
  await expect(page.getByTestId("lead-heading")).toHaveText(reference);

  await page.getByTestId("status-pipeline").getByRole("button", { name: "contacted" }).click();
  await expect(
    page.getByTestId("status-pipeline").getByRole("button", { name: "contacted" }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.locator("#note").fill("Called the customer; technician booked for tomorrow.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByTestId("lead-notes")).toContainText("technician booked");

  await page.reload();
  await expect(
    page.getByTestId("status-pipeline").getByRole("button", { name: "contacted" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("editor cannot open leads", async ({ page }) => {
  await login(page, "editor");
  await expect(page.getByRole("link", { name: "Leads" })).toHaveCount(0);
  await page.goto("/admin/leads");
  await expect(page.getByTestId("no-access")).toBeVisible();
});

test("editor publishes a service change and it appears on the public page", async ({ page }) => {
  const newSummary = `Free site survey, cameras and phone viewing — updated ${Date.now()}`;
  await login(page, "editor");
  await page.goto("/admin/content/services");
  await page.getByRole("link", { name: "CCTV installation" }).first().click();
  await page.locator("#f-summary").fill(newSummary);
  await page.getByTestId("content-save").click();
  await expect(page.getByText("Service saved")).toBeVisible();

  await page.goto("/services/cctv-installation");
  await expect(page.locator("main").getByText(newSummary).first()).toBeVisible();

  // Unpublishing hides it from the public site.
  await page.goto("/admin/content/services");
  const row = page.getByRole("row", { name: /CCTV installation/ });
  await row.getByRole("switch").click();
  await expect(row.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  const hidden = await page.request.get("/api/public/services");
  expect(JSON.stringify(await hidden.json())).not.toContain("cctv-installation");
  await row.getByRole("switch").click();
  await expect(row.getByRole("switch")).toHaveAttribute("aria-checked", "true");
});

test("editor changes page text and it appears on the home page", async ({ page }) => {
  await login(page, "editor");
  await page.goto("/admin/pages/home");
  await page.locator("#copy-heroHighlight").fill("runs on, every day.");
  await page.getByRole("button", { name: "Save page text" }).click();
  await expect(page.getByText("Saved — the page updates immediately")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("runs on, every day.");
});
