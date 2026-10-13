/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// Import polyfills for iOS compatibility
import "./polyfills/crypto.js";
import "./polyfills/ios.js";
import "./index.css";
import { showErrorMessage } from "./start/ErrorMessage.js";

// Enable mobile debugging in development
if (import.meta.env.DEV && new URLSearchParams(location.search).get("debug") === "1") {
	import("eruda")
		.then((eruda) => eruda.default.init())
		.catch((error: unknown) => {
			console.error("Failed to load mobile debugging tools:", error);
		});
}

async function start() {
	const client = process.env.FLUID_CLIENT ?? "local";

	switch (client) {
		case "local": {
			// Dynamically load local start to reduce initial bundle
			const { localStart } = await import("./start/localStart.js");
			await localStart();
			break;
		}
		case "azure": {
			// Dynamically load Azure start to reduce initial bundle
			const { azureStart } = await import("./start/azureStart.js");
			await azureStart();
			break;
		}
		default:
			throw new Error(`Unsupported FLUID_CLIENT: ${client}`);
	}
}

start().catch((error: unknown) => {
	console.error("Failed to start Canvas:", error);
	showErrorMessage(
		"Failed to start Canvas",
		error instanceof Error ? error.message : String(error),
		"Check the connection settings and reload."
	);
});
