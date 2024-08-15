/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import { test, expect } from "@playwright/test";

test.describe("item-counter", () => {
	/**
	 * Tracks the collaboration URL that is generated when navigating to the default URL.
	 * Includes the generated container ID.
	 */
	let collaborationUrl: string | undefined;

	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toBe("Fluid Demo");
		collaborationUrl = await page.url();
	});

	test("Load the container (smoke test)", async ({ page }) => {
		assert(collaborationUrl !== undefined);
		await page.goto(collaborationUrl, { waitUntil: "domcontentloaded" });
	});

	test("Increment and decrement counter", async ({ page }) => {
		assert(collaborationUrl !== undefined);
		await page.goto(collaborationUrl, { waitUntil: "domcontentloaded" });

		// Click the "Insert" button 3 times
		await page.click("text=Insert", { clickCount: 3 });

		// Verify the counter value
		let itemCountElement = await page.getByLabel("Item count");
		let itemCount = Number.parseInt(await itemCountElement.innerText());
		expect(itemCount).toEqual(3);

		// Click the "Remove" button 2 times
		await page.click("text=Remove", { clickCount: 2 });

		// Verify the counter value
		itemCountElement = await page.getByLabel("Item count");
		itemCount = Number.parseInt(await itemCountElement.innerText());
		expect(itemCount).toEqual(1);
	});
});
