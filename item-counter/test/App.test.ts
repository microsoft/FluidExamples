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
		await page.goto("http://localhost:8080", { waitUntil: "domcontentloaded" });
		expect(await page.title()).toBe("Fluid Demo");
		collaborationUrl = await page.url();
	});

	test("Load the container", async ({ page }) => {
		assert(collaborationUrl !== undefined);
		await page.goto(collaborationUrl, { waitUntil: "domcontentloaded" });
		await expect(page).toHaveScreenshot();
	});
});
