/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

const config = require("../jest.config");

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
		url = await page.url();
	});

	it("Load the container", async () => {
		console.log("Container URL---", url);
	});
});
