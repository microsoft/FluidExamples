/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as config from "../jest.config";
import { strict as assert } from "assert";

let url;

describe("react-starter-template", () => {
	const load = async () => {
		await page.goto(config.globals.URL, {
			waitUntil: ["networkidle2", "load"],
			timeout: 100000,
		});
	};

	beforeEach(async () => {
		await load();
		expect(await page.title()).toBe("React App");
		await page.click(".create");
		url = await page.url();
		assert(url.includes("fluid/"), true, "No container id found");
	});

	it("Load the page", async () => {
		console.log("Container URL---", url);
		await page.goto(url, { waitUntil: "load" });
	});

	it("check audience size", async () => {
		let element1 = await page.$(".size");
		const initialSize = await page.evaluate((e1) => e1.textContent, element1);

		console.log(initialSize.charAt(15));
		expect(initialSize.charAt(15)).toBe("2");
	});
});
