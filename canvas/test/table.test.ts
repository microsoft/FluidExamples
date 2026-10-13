import { test, expect } from "./test-utils.js";

test("table text, numbers, and dates synchronize between clients", async ({ page, peer }) => {
	await page.getByRole("button", { name: /Add a data table/ }).click();
	await expect(peer.locator("#canvas table")).toBeVisible();
	await page.locator('tbody input[type="text"]').first().fill("Shared cell");
	await expect(peer.locator('tbody input[type="text"]').first()).toHaveValue("Shared cell");
	await peer.locator('tbody input[type="number"]').first().fill("42");
	await expect(page.locator('tbody input[type="number"]').first()).toHaveValue("42");
	await page.locator('tbody input[type="date"]').first().fill("2026-10-13");
	await expect(peer.locator('tbody input[type="date"]').first()).toHaveValue("2026-10-13");
	await peer.locator('tbody input[type="date"]').first().fill("");
	await expect(page.locator('tbody input[type="date"]').first()).toHaveValue("");
});

test("large tables virtualize their rows", async ({ page }) => {
	await page.getByRole("button", { name: /Add a data table/ }).click();
	await page.locator("[data-item-id]").click();
	await page.getByRole("button", { name: "Insert 1000 rows with random values" }).click();
	await expect(page.locator("#canvas table")).toHaveAttribute("aria-rowcount", "1011");
	await expect(page.getByText("saved", { exact: true })).toBeVisible();
	const rows = page.locator("#canvas tbody tr");
	await expect.poll(() => rows.count()).toBeGreaterThan(0);
	await expect.poll(() => rows.count()).toBeLessThan(100);
	await page.getByTestId("table-viewport").evaluate((element) => {
		element.scrollTop = element.scrollHeight;
	});
	await expect(page.locator('#canvas tr[data-index="1009"]')).toBeVisible();
	expect(await rows.count()).toBeLessThan(100);
});
