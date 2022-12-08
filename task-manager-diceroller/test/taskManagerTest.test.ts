/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
import * as config from "../jest.config";

let url;

describe("task-manager-diceroller", () => {
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
});
