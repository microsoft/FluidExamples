/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect } from "@playwright/test";

test.describe("Canvas Operations", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
		// Wait for app to be fully loaded
		await expect(page.locator("#canvas")).toBeVisible();
	});

	test.describe("Shape Creation", () => {
		test("should create a circle", async ({ page }) => {
			// Click the new circle button
			await page.getByRole("button", { name: /Add a circle shape/i }).click();

			// Verify circle appears on canvas
			await expect(page.locator("[data-item-id]")).toHaveCount(1);
		});

		test("should create a square", async ({ page }) => {
			await page.getByRole("button", { name: /Add a square shape/i }).click();

			await expect(page.locator("[data-item-id]")).toHaveCount(1);
		});

		test("should create a triangle", async ({ page }) => {
			await page.getByRole("button", { name: /Add a triangle shape/i }).click();

			await expect(page.locator("[data-item-id]")).toHaveCount(1);
		});

		test("should create a star", async ({ page }) => {
			await page.getByRole("button", { name: /Add a star shape/i }).click();

			await expect(page.locator("[data-item-id]")).toHaveCount(1);
		});

		test("should create multiple shapes", async ({ page }) => {
			// Create multiple different shapes
			await page.getByRole("button", { name: /Add a circle shape/i }).click();
			await page.getByRole("button", { name: /Add a square shape/i }).click();
			await page.getByRole("button", { name: /Add a triangle shape/i }).click();

			// Verify all shapes exist
			await expect(page.locator("[data-item-id]")).toHaveCount(3);
		});
	});

	test.describe("Note Creation", () => {
		test("should create a note", async ({ page }) => {
			await page.getByRole("button", { name: /Add a sticky note/i }).click();

			await expect(page.locator("[data-item-id]")).toHaveCount(1);
		});

		test("should edit note text", async ({ page }) => {
			// Create a note
			await page.getByRole("button", { name: /Add a sticky note/i }).click();

			// Find and edit the note
			const noteTextarea = page.locator("textarea").first();
			await noteTextarea.fill("Test note content");

			// Verify text was saved
			await expect(noteTextarea).toHaveValue("Test note content");
		});

		test("should create multiple notes", async ({ page }) => {
			// Create multiple notes
			await page.getByRole("button", { name: /Add a sticky note/i }).click();
			await page.getByRole("button", { name: /Add a sticky note/i }).click();
			await page.getByRole("button", { name: /Add a sticky note/i }).click();

			await expect(page.locator("[data-item-id]")).toHaveCount(3);
		});
	});

	test.describe("Table Creation", () => {
		test("should create a table", async ({ page }) => {
			await page.getByRole("button", { name: /Add a data table/i }).click();

			const tables = page.locator("[data-item-id]");
			await expect(tables).toHaveCount(1);
		});
	});

	test.describe("Selection and Manipulation", () => {
		test("should delete selected item", async ({ page }) => {
			// Create and select a shape
			await page.getByRole("button", { name: /Add a circle shape/i }).click();
			const shape = page.locator("[data-item-id]").first();
			await shape.click();

			// Delete the selected item
			await page.getByRole("button", { name: /delete/i }).click();

			// Verify shape is gone
			await expect(page.locator("[data-item-id]")).toHaveCount(0);
		});

		test("should duplicate selected item", async ({ page }) => {
			// Create and select a shape
			await page.getByRole("button", { name: /Add a circle shape/i }).click();
			const shape = page.locator("[data-item-id]").first();
			await shape.click();

			// Duplicate the item
			await page.getByRole("button", { name: /duplicate/i }).click();

			// Verify we now have 2 shapes
			await expect(page.locator("[data-item-id]")).toHaveCount(2);
		});
	});
});
