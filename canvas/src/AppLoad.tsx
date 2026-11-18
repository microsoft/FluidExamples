import { AzureClient } from "@fluidframework/azure-client";
import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { App, appTreeConfiguration } from "./schema/appSchema.js";
import { createUndoRedoStacks } from "./undo/undo.js";
import { containerSchema } from "./schema/containerSchema.js";
import { loadFluidData } from "./infra/fluid.js";
import { IFluidContainer } from "fluid-framework";
import { FluentProvider } from "@fluentui/react-provider";
import { webLightTheme } from "@fluentui/react-theme";
import { AuthContext } from "./react/contexts/AuthContext.js";
import { showErrorMessage } from "./start/ErrorMessage.js";

// Lazy load the main React app to reduce initial bundle size
const ReactApp = lazy(() =>
	import("./react/components/app/App.js").then((module) => ({
		default: module.ReactApp,
	}))
);

// Loading component - blank initially, then shows message after 5 seconds
const AppLoadingSpinner = () => {
	const [showMessage, setShowMessage] = React.useState(false);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setShowMessage(true);
		}, 5000); // Show message after 5 seconds

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="h-screen bg-white">
			{showMessage && (
				<div className="flex items-center justify-center h-full">
					<p className="text-lg text-gray-600">Working on it...</p>
				</div>
			)}
		</div>
	);
};

import { getPresence } from "@fluidframework/presence/beta";
import { createTypedSelectionManager } from "./presence/selection.js";
import { createUsersManager } from "./presence/users.js";
import { UserInfo } from "./presence/Interfaces/UsersManager.js";
import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";
import { createDragManager } from "./presence/drag.js";
import { createResizeManager } from "./presence/resize.js";
import { createInkPresenceManager } from "./presence/ink.js";
import { createCursorManager } from "./presence/cursor.js";

export async function loadApp(props: {
	client: AzureClient;
	containerId: string;
	account: AccountInfo;
	user?: UserInfo;
	msalInstance: PublicClientApplication;
}): Promise<IFluidContainer> {
	const { client, containerId, account, user, msalInstance } = props;

	try {
		// Initialize Fluid Container
		const { container } = await loadFluidData(containerId, containerSchema, client);

		// Initialize the SharedTree DDSes
		const appTree = container.initialObjects.appData.viewWith(appTreeConfiguration);
		if (appTree.compatibility.canInitialize) {
			appTree.initialize(new App({ items: [], comments: [], inks: [] }));
		}

		// Get the Presence data object from the container
		const presence = getPresence(container);

		// Create a workspace for the selection manager
		const workspace = presence.states.getWorkspace("workspace:main", {});

		// Create the current UserInfo object
		const userInfo: UserInfo = user || {
			name: account.name ?? account.username, // Use the name or username from the account
			id: account.homeAccountId, // Use the homeAccountId as the unique user ID
		};

		// Create a selection manager in the workspace
		// The selection manager will be used to manage the selection of cells in the table
		// and will be used to synchronize the selection across clients
		const itemSelection = createTypedSelectionManager({
			name: "selection:item", // The name of the workspace
			workspace, // The presence workspace
		});

		const tableSelection = createTypedSelectionManager({
			name: "selection:table", // The name of the workspace
			workspace, // The presence workspace
		});

		// Create a users manager to manage the users in the app
		const users = createUsersManager({
			name: "users:main", // The name of the users manager
			workspace, // The presence workspace
			me: userInfo, // The current user
		});

		const drag = createDragManager({
			name: "drag:main",
			workspace,
		});

		const resize = createResizeManager({
			name: "resize:main",
			workspace,
		});

		const ink = createInkPresenceManager({
			name: "ink:stroke",
			workspace,
		});

		const cursor = createCursorManager({
			name: "cursor:main",
			workspace,
		});

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
			<FluentProvider theme={webLightTheme}>
				<AuthContext.Provider value={{ msalInstance }}>
					<Suspense fallback={<AppLoadingSpinner />}>
						<ReactApp
							tree={appTree}
							itemSelection={itemSelection}
							tableSelection={tableSelection}
							drag={drag}
							resize={resize}
							ink={ink}
							cursor={cursor}
							users={users}
							container={container}
							undoRedo={undoRedo}
						/>
					</Suspense>
				</AuthContext.Provider>
			</FluentProvider>
		);

		return container;
	} catch (error) {
		console.error("Error loading Fluid Framework application:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		showErrorMessage(
			"Failed to load Fluid Framework application",
			"Error details: " + errorMessage,
			"This could be due to network connectivity issues or service unavailability."
		);
		throw error; // Re-throw to allow calling code to handle appropriately
	}
}
