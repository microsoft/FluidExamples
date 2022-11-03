/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

const config = require("../jest.config");

let url;

describe("react-demo", () => {
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
		await page.goto(url, { waitUntil: "domcontentloaded" });
	});

	it("set the time", async () => {
		let element1 = await page.$(".time");
		const initialValue = await page.evaluate((el) => el.textContent, element1);

		console.log(initialValue);

		await page.click(".click");

		const changedVal = await page.evaluate((e1) => e1.textContent, element1);
		console.log(changedVal);
	});

	it("load a new page", async () => {
		await load();
		const newUrl = await page.url();

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
