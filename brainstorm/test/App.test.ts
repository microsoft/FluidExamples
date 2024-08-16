/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect } from "@playwright/test";

test.describe("brainstorm", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
	});

	test("Load the container (smoke test)", async ({ page }) => {
		// Navigate to the default URL - new Container case
		await page.goto("/", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toBe("Brainstorm Demo");
		const collaborationUrl = await page.url();

		// Navigate to the collaboration URL - load existing Container case
		await page.goto(collaborationUrl, { waitUntil: "domcontentloaded" });
	});

	test("Add group", async ({ page }) => {
		let groups = await page.getByLabel("Note Group");
		expect(groups).toHaveCount(0);

		// Click the "Add Group" button
		await page.getByText("Add Group").click();

		// Verify that a group was added.
		groups = await page.getByLabel("Note Group");
		expect(groups).toHaveCount(1);
	});

	test("Add note", async ({ page }) => {
		let notes = await page.getByLabel("Note");
		expect(notes).toHaveCount(0);

		// Click the "Add Note" button
		await page.getByText("Add Note").click();

		// Verify that a note was added.
		notes = await page.getByLabel("Note");
		expect(notes).toHaveCount(1);
	});

	test("Delete note", async ({ page }) => {
		// Click the "Add Note" button
		await page.getByText("Add Note").click();

		// Select the note.
		await page.getByLabel("Note").click(); // Will time out if no note exists on the canvas.

		let notes = await page.getByLabel("Note");
		expect(notes).toHaveCount(1);

		// Click the "Delete" button.
		await page.getByText("Delete Note").click();

		notes = await page.getByLabel("Note");
		expect(notes).toHaveCount(0);
	});
});
