/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });

		// Wait for the app to load (should work in local mode without auth)
		await expect(page.locator("#canvas")).toBeVisible({ timeout: 10000 });
	});

	test("should load the container successfully", async ({ page }) => {
		// Test that the main components are visible
		await expect(page.locator("#main")).toBeVisible();
		await expect(page.locator("#canvas")).toBeVisible();

		// Wait for the Fluid container to be ready by waiting for buttons to be enabled
		// In local mode, buttons may be disabled initially while container is setting up
		await expect(page.getByRole("button", { name: /Add a circle shape/i })).toBeEnabled({
			timeout: 15000,
		});

		// Test that creation buttons are available and enabled
		await expect(page.getByRole("button", { name: /Add a circle shape/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Add a square shape/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Add a data table/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Add a sticky note/i })).toBeVisible();
	});

	test("should create and interact with basic items", async ({ page }) => {
		// Wait for buttons to be enabled before interacting
		await expect(page.getByRole("button", { name: /Add a sticky note/i })).toBeEnabled({
			timeout: 15000,
		});

		// Create a note
		await page.getByRole("button", { name: /Add a sticky note/i }).click();
		await expect(page.locator("[data-item-id]")).toHaveCount(1);
		await expect(page.getByRole("textbox", { name: /Type your note here/i })).toBeVisible();

		// Create a shape
		await page.getByRole("button", { name: /Add a circle shape/i }).click();
		await expect(page.locator("[data-item-id]")).toHaveCount(2); // Should have note + circle

		// Select and delete an item (select the second item - the circle)
		await page.locator("[data-item-id]").nth(1).click();
		await page.getByRole("button", { name: /Delete item/i }).click();
		await expect(page.locator("[data-item-id]")).toHaveCount(1); // Should have only note left
	});
});
