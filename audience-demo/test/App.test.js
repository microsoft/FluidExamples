/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as config from "../jest.config";
import { strict as assert } from "assert";

let url;

describe("audience-demo", () => {
	const load = async () => {
		await page.goto(config.globals.URL, {
			waitUntil: ["networkidle2", "load"],
			timeout: 100000,
		});
	};

	beforeEach(async () => {
		await load();
		expect(await page.title()).toBe("Fluid Audience Example");
		await page.click(".user1");
		url = await page.url();
	});

	it("Add three users", async () => {
		console.log("Container URL---", url);
		await page.goto(url, { waitUntil: "load" });
		const containerId = url.split("#")[1];
		console.log("container id: ", containerId);
		assert(url.includes("/#"), true, "No container id found");

		await page.click(".user1");

		await page.goto(url, { waitUntil: "load" });
		await page.$eval("#containerIdInput", (el, id) => (el.value = id), containerId);
		await page.click(".user2");

		await page.goto(url, { waitUntil: "load" });
		await page.$eval("#containerIdInput", (el, id) => (el.value = id), containerId);
		await page.click(".randomUser");
	});
});
