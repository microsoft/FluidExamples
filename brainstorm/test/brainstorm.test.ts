/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as config from "../jest.config";
import { strict as assert } from "assert";

let url;

describe("brainstorm", () => {
	const load = async () => {
		await page.goto(config.globals.URL, {
			waitUntil: ["networkidle2", "load"],
			timeout: 100000,
		});
	};

	beforeEach(async () => {
		await load();
		expect(await page.title()).toBe("Lets Brainstorm");
		url = await page.url();
		assert(url.includes("/#"), true, "No container id found");
	});

	it("Reload the page", async () => {
		console.log("Container URL---", url);
		await page.goto(url, { waitUnitl: "load" });
	});
});
