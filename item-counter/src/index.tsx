/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable react/jsx-key */
import React from "react";
import { createRoot } from "react-dom/client";
import { loadFluidData, containerSchema } from "./infra/fluid";
import { initializeDevtools } from "@fluidframework/devtools";
import { devtoolsLogger } from "./infra/clientProps";
import { treeConfiguration } from "./schema";
import "./output.css";
import { ReactApp } from "./react_app";

async function start() {
	// create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);
	const root = createRoot(app);

	// Get the root container id from the URL
	// If there is no container id, then the app will make
	// a new container.
	let containerId = location.hash.substring(1);

	// Initialize Fluid Container - this will either make a new container or load an existing one
	const { container } = await loadFluidData(containerId, containerSchema);

	// Initialize the SharedTree Data Structure
	const appData = container.initialObjects.appData.schematize(
		treeConfiguration, // This is defined in schema.ts
	);

	// Initialize debugging tools
	initializeDevtools({
		logger: devtoolsLogger,
		initialContainers: [
			{
				container,
			},
		],
	});

	// Render the app - note we attach new containers after render so
	// the app renders instantly on create new flow. The app will be
	// interactive immediately.
	root.render(<ReactApp data={appData} />);

	// If the app is in a `createNew` state - no containerId, and the container is detached, we attach the container.
	// This uploads the container to the service and connects to the collaboration session.
	if (containerId.length == 0) {
		containerId = await container.attach();

		// The newly attached container is given a unique ID that can be used to access the container in another session.
		// This adds that id to the url.
		history.replaceState(undefined, "", "#" + containerId);
	}
}

start().catch((error) => console.error(error));
