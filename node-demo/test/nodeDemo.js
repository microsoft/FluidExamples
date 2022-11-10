/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { SharedMap } from "fluid-framework";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import readlineSync from "readline-sync";

const schema = {
	initialObjects: { sharedRandomNumber: SharedMap },
};

let arr = [];
const randomNumberKey = "random-number-key";

const client = new TinyliciousClient();

export async function createContainer() {
	const { container } = await client.createContainer(schema);
	container.initialObjects.sharedRandomNumber.set(randomNumberKey, 1);
	const id = await container.attach();
	arr.push(id);
	await loadCli(container.initialObjects.sharedRandomNumber);
}

export async function loadContainer(id) {
	const { container } = await client.getContainer(id, schema);
	await loadCli(container.initialObjects.sharedRandomNumber);
}

async function loadCli(map) {
	// Set a timer to update the random number every 1 second
	const newRandomNumber = () => {
		map.set(randomNumberKey, Math.floor(Math.random() * 100) + 1);
		if (arr.length > 20) {
			clearInterval(interval);
			process.exit(0);
		}
	};

	const interval = setInterval(newRandomNumber, 1000);

	// Listen for updates and print changes to the random number
	const updateConsole = () => {
		console.log(arr);
		arr.push(map.get(randomNumberKey));
	};
	updateConsole();
	map.on("valueChanged", updateConsole);
}

export async function start() {
	const containerId = readlineSync.question("Type a Container ID or press Enter to continue: ");

	if (containerId.length === 0 || containerId === "undefined" || containerId === "null") {
		await createContainer();
	} else {
		await loadContainer(containerId);
	}
}
