/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sinon from "sinon";
import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import { createContainer, loadContainer } from "./nodeDemo.js";

let spy, containerId;
var createArr = [],
	loadArr = [];

chai.use(sinonChai);

describe("node-demo", async () => {
	beforeEach(function () {
		spy = sinon.spy(console, "log");
	});

	afterEach(function () {
		spy.restore();
	});

	let sleepNow = (delay) =>
		new Promise((resolve) => {
			setTimeout(() => {
				resolve("DONE");
			}, delay);
		});

	describe("check console log is called", function () {
		it("create container", async function () {
			await createContainer().catch(() => {
				console.error("Unable to create the container");
				process.exit();
			});

			await sleepNow(5000);

			createArr = spy.getCall(3).args;
			containerId = createArr[0][0];
			console.log("SPY CREATE CALL----", createArr);
			expect(createArr).to.not.be.empty;
		});

		it("load container", async function () {
			await loadContainer(containerId).catch(() => {
				console.error("Unable to load the container");
				process.exit();
			});

			await sleepNow(2000);

			loadArr = spy.getCall(3).args;
			console.log("SPY LOAD CALL----", loadArr);
			expect(loadArr).to.not.be.empty;
		});

		it("compare values", async function () {
			for (const i of createArr) {
				expect(createArr[i]).to.equal(loadArr[i]);
			}
		});
	});
});
