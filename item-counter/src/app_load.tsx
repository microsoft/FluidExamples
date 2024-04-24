import { OdspClient } from "@fluid-experimental/odsp-client";
import { AzureClient } from "@fluidframework/azure-client";
import React from "react";
import { createRoot } from "react-dom/client";
import { ReactApp } from "./react_app.js";
import { treeConfiguration } from "./schema.js";
import { containerSchema } from "./schema.js";
import { loadFluidData } from "./infra/fluid.js";
import { IFluidContainer } from "fluid-framework";

export async function loadApp(
	client: AzureClient | OdspClient,
	containerId: string,
): Promise<IFluidContainer> {
	// Initialize Fluid Container
	const { container } = await loadFluidData(containerId, containerSchema, client);

	// Initialize the SharedTree DDSes
	const appTree = container.initialObjects.appData.schematize(treeConfiguration);

	// create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);
	const root = createRoot(app);

	// Render the app - note we attach new containers after render so
	// the app renders instantly on create new flow. The app will be
	// interactive immediately.
	root.render(<ReactApp data={appTree} />);

	return container;
}
