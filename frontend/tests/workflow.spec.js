import { test, expect } from "@playwright/test";
test.beforeEach(async ({ request }) => {
  await request.post("http://127.0.0.1:8001/api/reset");
});
test("full evacuation demo and form submission", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Every person/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View dashboard" }).click();
  await expect(
    page.getByRole("heading", { name: "Operations overview." }),
  ).toBeVisible();
  await expect(page.getByText("All people accommodated")).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Simulation", exact: true }).click();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Block road", exact: true }).click();
  await expect(
    page.getByText("Road R4 is blocked. Recalculate using available roads."),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Evacuation plan updated using available roads and shelters.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Make full", exact: true }).click();
  await expect(page.locator("table")).toContainText("College Auditorium");
  await expect(page.locator("table")).not.toContainText("Government School");
  await page
    .getByRole("link", { name: "Evacuation plan", exact: true })
    .click();
  await expect(page.locator(".route-card")).toHaveCount(2);
  await expect(page.locator(".route-card").first()).toContainText("9 km");
  await page.getByRole("link", { name: "New disaster", exact: true }).click();
  await page.getByLabel("Affected population").fill("900");
  await page
    .getByLabel("Description")
    .fill("College demonstration flood exercise.");
  await page.getByRole("button", { name: /Start evacuation analysis/ }).click();
  await expect(
    page.getByRole("heading", { name: "Evacuation plan", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("300 unallocated", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Shelters", exact: true }).click();
  await expect(page.locator(".shelter-card")).toHaveCount(3);
  await page.getByRole("link", { name: "Road network", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page.getByRole("link", { name: "About project", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The intelligence behind the plan" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile navigation and layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Operations overview." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Simulation", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Emergency simulation" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/simulation-mobile.png",
    fullPage: true,
  });
});
