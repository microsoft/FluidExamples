import { AzureClient } from "@fluidframework/azure-client";
import { OdspClient } from "@fluidframework/odsp-client/beta";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";
import { ReactApp } from "./react/ux.js";
import { Items, appTreeConfiguration } from "./schema/app_schema.js";
import { sessionTreeConfiguration } from "./schema/session_schema.js";
import { createUndoRedoStacks } from "./utils/undo.js";
import { containerSchema } from "./schema/container_schema.js";
import { loadFluidData } from "./infra/fluid.js";
import { IFluidContainer } from "fluid-framework";

export async function loadApp(
	client: AzureClient | OdspClient,
	containerId: string,
): Promise<IFluidContainer> {
	// Initialize Fluid Container
	const { services, container } = await loadFluidData(containerId, containerSchema, client);

	// Initialize the SharedTree DDSes
	const sessionTree = container.initialObjects.sessionData.viewWith(sessionTreeConfiguration);
	if (sessionTree.compatibility.canInitialize) {
		sessionTree.initialize({ clients: [] });
	}
	const appTree = container.initialObjects.appData.viewWith(appTreeConfiguration);
	if (appTree.compatibility.canInitialize) {
		appTree.initialize(new Items([]));
	}

	// create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);
	const root = createRoot(app);

	// Create undo/redo stacks for the app
	const undoRedo = createUndoRedoStacks(appTree.events);

	// Render the app - note we attach new containers after render so
	// the app renders instantly on create new flow. The app will be
	// interactive immediately.
	root.render(
		<DndProvider backend={HTML5Backend}>
			<ReactApp
				items={appTree}
				sessionTree={sessionTree}
				audience={services.audience}
				container={container}
				undoRedo={undoRedo}
			/>
		</DndProvider>,
	);

	return container;
}
