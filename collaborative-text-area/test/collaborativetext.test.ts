/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
import * as config from "../jest.config";

let url;

describe("collaborative-text-area", () => {
	const load = async () => {
		await page.goto(config.globals.URL, {
			waitUntil: ["networkidle2", "load"],
			timeout: 100000,
		});
	};

	beforeEach(async () => {
		await load();
		expect(await page.title()).toBe("React App");
		url = await page.url();
		assert(url.includes("#"), true, "No container id found");
	});

	it("Load the container", async () => {
		console.log("Container URL---", url);
		await page.goto(url, { waitUntil: "load" });
	});

	it("Initial textarea is empty", async () => {
		const ta = await page.$(".text-area");
		const value = await ta.evaluate((element) => element.textContent);
		expect(value).toBe("");
	});

	it("User1 types hello", async () => {
		await page.type(".text-area", "hello");

		await page.goto(url, { waitUntil: "load" });
		const ta = await page.$(".text-area");
		const value = await ta.evaluate((element) => element.textContent);

		expect(value).toBe("hello");
	});
});
