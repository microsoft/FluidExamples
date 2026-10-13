/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { AzureClient } from "@fluidframework/azure-client";
import { loadApp } from "../AppLoad.js";
import { getClientProps } from "../infra/azure/azureClientProps.js";
import { AttachState } from "fluid-framework";
import { showErrorMessage } from "./ErrorMessage.js";

const localId = crypto.randomUUID();
const localUser = {
	name: `Guest ${localId.slice(0, 6)}`,
	id: localId,
	image: undefined,
};

export async function localStart() {
	// Starting Fluid Framework Demo in LOCAL mode
	// No authentication required for local development

	try {
		// Create Azure client with local configuration
		const client = new AzureClient(getClientProps(localUser));

		// Get the root container id from the URL
		// The id is a parameter on the url
		const urlParams = new URLSearchParams(window.location.search);
		let containerId = urlParams.get("id") ?? "";

		// Load the app with local configuration
		const container = await loadApp({
			client,
			containerId,
			user: localUser,
			msalInstance: null,
		});

		// Update URL with container ID for collaboration
		if (container.attachState === AttachState.Detached) {
			containerId = await container.attach();
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set("id", containerId);
			window.history.replaceState({}, "", newUrl.toString());
		}
	} catch (error) {
		console.error("Error starting local Fluid demo:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		showErrorMessage(
			"Failed to load Fluid Demo in local mode",
			"Error details: " + errorMessage,
			"Please check the console for more information."
		);
	}
}
