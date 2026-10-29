/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// Import polyfills for iOS compatibility
import "./polyfills/crypto.js";
import "./polyfills/ios.js";

// Enable mobile debugging in development
if (process.env.NODE_ENV === "development") {
	import("eruda").then((eruda) => eruda.default.init());
}

async function start() {
	const client = process.env.FLUID_CLIENT;

	switch (client) {
		case "local": {
			// Dynamically load local start to reduce initial bundle
			const { localStart } = await import("./start/localStart.js");
			await localStart();
			break;
		}
		default: {
			// Dynamically load Azure start to reduce initial bundle
			const { azureStart } = await import("./start/azureStart.js");
			await azureStart();
			break;
		}
	}
}

start();
