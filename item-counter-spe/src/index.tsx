import React from "react";
import { createRoot } from "react-dom/client";
import { loadFluidData, containerSchema } from "./infra/fluid.js";
import { getClientProps } from "./infra/clientProps.js";
import { treeConfiguration } from "./schema.js";
import "./output.css";
import { ReactApp } from "./react_app.js";
import { SampleOdspTokenProvider } from "./infra/tokenProvider.js";
import { GraphHelper } from "./infra/graphHelper.js";
import { authHelper } from "./infra/authHelper.js";
import type { ITelemetryBaseLogger } from "@fluidframework/core-interfaces";
import { OdspClient } from "@fluidframework/odsp-client/beta";
import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";
import { AttachState } from "fluid-framework";

async function start() {
	const msalInstance = await authHelper();

	// Handle the login redirect flows
	const tokenResponse = await msalInstance.handleRedirectPromise();

	// If the tokenResponse is not null, then the user is signed in
	// and the tokenResponse is the result of the redirect.
	if (tokenResponse !== null) {
		await signedInStart(msalInstance, tokenResponse.account);
	} else {
		const currentAccounts = msalInstance.getAllAccounts();
		if (currentAccounts.length === 0) {
			// no accounts signed-in, attempt to sign a user in
			msalInstance.loginRedirect({
				scopes: ["FileStorageContainer.Selected", "Files.ReadWrite"],
			});
		} else if (currentAccounts.length > 1 || currentAccounts.length === 1) {
			// The user is singed in.
			// Treat more than one account signed in and a single account the same as
			// this is just a sample. But a real app would need to handle the multiple accounts case.
			// For now, just use the first account.
			const account = msalInstance.getAllAccounts()[0];
			await signedInStart(msalInstance, account);
		}
	}
}

function showErrorMessage(message?: string, ...optionalParams: string[]) {
	// create the root element for React
	const error = document.createElement("div");
	error.id = "app";
	document.body.appendChild(error);
	const root = createRoot(error);

	// Render the error message
	root.render(
		<div className="container mx-auto p-2 m-4 border-2 border-black rounded">
			<p>{message}</p>
			<p>{optionalParams.join(" ")}</p>
		</div>,
	);
}

async function signedInStart(msalInstance: PublicClientApplication, account: AccountInfo) {
	// Set the active account
	msalInstance.setActiveAccount(account);

	// Create the GraphHelper instance
	// This is used to interact with the Graph API
	// Which allows the app to get the file storage container id, the Fluid container id,
	// and the site URL.
	const graphHelper = new GraphHelper(msalInstance, account);

	// Define a function to get the container info based on the URL hash
	// The URL hash is the shared item id and will be used to get the file storage container id
	// and the Fluid container id. If there is no hash, then the app will create a new Fluid container
	// in a later step.
	const getContainerInfo = async () => {
		const shareId = location.hash.substring(1);
		if (shareId.length > 0) {
			try {
				return await graphHelper.getSharedItem(shareId);
			} catch (error) {
				showErrorMessage("Error while fetching shared item: ", error as string);
				return undefined;
			}
		} else {
			return undefined;
		}
	};

	// Get the file storage container id (driveId) and the Fluid container id (itemId).
	const containerInfo = await getContainerInfo();

	// Define a function to get the file storage container id using the Graph API
	// If the user doesn't have access to the file storage container, then the app will fail here.
	const getFileStorageContainerId = async () => {
		try {
			return await graphHelper.getFileStorageContainerId();
		} catch (error) {
			showErrorMessage("Error while fetching file storage container ID: ", error as string);
			return "";
		}
	};

	let fileStorageContainerId = "";
	let containerId = "";

	// If containerInfo is undefined, then get the file storage container id using the function
	// defined above.
	// If the containerInfo is not undefined, then use the file storage container id and Fluid container id
	// from containerInfo.
	if (containerInfo === undefined) {
		fileStorageContainerId = await getFileStorageContainerId();
	} else {
		fileStorageContainerId = containerInfo.driveId;
		containerId = containerInfo.itemId;
	}

	// If the file storage container id is empty, then the app will fail here.
	if (fileStorageContainerId.length == 0) {
		return;
	}

	// Initialize Devtools logger if in development mode
	let telemetryLogger: ITelemetryBaseLogger | undefined;
	if (process.env.NODE_ENV === "development") {
		const { createDevtoolsLogger } = await import("@fluidframework/devtools/beta");
		telemetryLogger = createDevtoolsLogger();
	}

	// Create the client properties required to initialize
	// the Fluid client instance. The Fluid client instance is used to
	// interact with the Fluid service.
	const clientProps = getClientProps(
		await graphHelper.getSiteUrl(),
		fileStorageContainerId,
		new SampleOdspTokenProvider(msalInstance),
		telemetryLogger,
	);

	// Create the Fluid client instance
	const client = new OdspClient(clientProps);

	// Create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);
	const root = createRoot(app);

	// Initialize Fluid Container - this will either make a new container or load an existing one
	const { container } = await loadFluidData(
		containerId,
		containerSchema,
		client,
		telemetryLogger,
	);

	// Initialize the SharedTree Data Structure
	const appData = container.initialObjects.appData.viewWith(
		treeConfiguration, // This is defined in schema.ts
	);
	if (appData.compatibility.canInitialize) {
		appData.initialize([]);
	}

	// Render the app - note we attach new containers after render so
	// the app renders instantly on create new flow. The app will be
	// interactive immediately.
	root.render(<ReactApp data={appData} />);

	// If the app is in a `createNew` state - no containerId, and the container is detached, we attach the container.
	// This uploads the container to the service and connects to the collaboration session.
	if (container.attachState === AttachState.Detached) {
		// Attach the container to the Fluid service which
		// uploads the container to the service and connects to the collaboration session.
		// This returns the Fluid container id.
		const itemId = await container.attach();

		// Create a sharing id to the container.
		// This allows the user to collaborate on the same Fluid container
		// with other users just by sharing the link.
		const shareId = await graphHelper.createSharingLink(
			clientProps.connection.driveId,
			itemId,
			"edit",
		);

		// Set the URL hash to the sharing id.
		history.replaceState(undefined, "", "#" + shareId);
	}
}

start().catch((error) => console.error(error));
