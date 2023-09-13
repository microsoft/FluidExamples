/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as config from "../jest.config";

let url;

describe("angular-demo", () => {
	const load = async () => {
		await page.goto(config.globals.URL, {
			waitUntil: ["networkidle2", "load"],
			timeout: 100000,
		});
	};

	beforeEach(async () => {
		await load();
		expect(await page.title()).toBe("Vue + Fluid App");
		await page.click(".getTime");
		url = await page.url();
	});

	it("Load the page", async () => {
		console.log("Container URL---", url);
		await page.goto(url, { waitUntil: "load" });
	});

	it("set the time", async () => {
		let element1 = await page.$(".time");
		const initialValue = await page.evaluate((el) => el.textContent, element1);

		console.log(initialValue);

		await page.click(".getTime");

		const changedVal = await page.evaluate((e1) => e1.textContent, element1);
		console.log(changedVal);
	});

	it("get time", async () => {
		await load();
		const newUrl = await page.url();

		await page.click(".getTime");
		let element1 = await page.$(".time");
		const value1 = await page.evaluate((e1) => e1.textContent, element1);
		console.log(value1);

		await page.goto(newUrl);
		let element2 = await page.$(".time");
		const value2 = await page.evaluate((e1) => e1.textContent, element2);
		console.log(value2);

		expect(value1).toBe(value2);
	});
});
