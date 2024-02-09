/* eslint-disable react/jsx-key */
import React from "react";
import { createRoot } from "react-dom/client";
import { loadFluidData, containerSchema } from "./infra/fluid";
import { devtoolsLogger, getClientProps } from "./infra/clientProps";
import { treeConfiguration } from "./schema";
import "./output.css";
import { ReactApp } from "./react_app";
import { OdspTestTokenProvider } from "./infra/tokenProvider";
import { GraphHelper } from "./infra/graphHelper";
import { authHelper } from "./infra/authHelper";
import { OdspClient } from "@fluid-experimental/odsp-client";
import { ITree } from "@fluidframework/tree";
import { initializeDevtools } from "@fluidframework/devtools";
import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";

async function start() {
	const msalInstance = await authHelper();

	// Handle the redirect flows
	msalInstance
		.handleRedirectPromise()
		.then((tokenResponse) => {
			if (tokenResponse !== null) {
				const account = msalInstance.getAllAccounts()[0];
				signedInStart(msalInstance, account);
			} else {
				const currentAccounts = msalInstance.getAllAccounts();
				if (currentAccounts.length === 0) {
					// no accounts signed-in, attempt to sign a user in
					msalInstance.loginRedirect({
						scopes: ["FileStorageContainer.Selected", "Files.ReadWrite"],
					});
				} else if (currentAccounts.length > 1) {
					// more than one account signed in, need to handle that
					// just use the first account for now
					const account = msalInstance.getAllAccounts()[0];
					signedInStart(msalInstance, account);
				} else if (currentAccounts.length === 1) {
					// one account signed in, proceed with that account
					const account = msalInstance.getAllAccounts()[0];
					signedInStart(msalInstance, account);
				}
			}
		})
		.catch((error) => {
			console.log("Error in handleRedirectPromise: " + error.message);
		});
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
	msalInstance.setActiveAccount(account);

	const graphHelper = new GraphHelper(msalInstance, account);

	// Get the root container id from the URL
	// If there is no container id, then the app will make
	// a new container.
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

	const containerInfo = await getContainerInfo();

	// Get the file storage container id
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

	if (containerInfo === undefined) {
		fileStorageContainerId = await getFileStorageContainerId();
	} else {
		fileStorageContainerId = containerInfo.driveId;
		containerId = containerInfo.itemId;
	}

	if (fileStorageContainerId.length == 0) {
		return;
	}

	const clientProps = getClientProps(
		await graphHelper.getSiteUrl(),
		fileStorageContainerId,
		new OdspTestTokenProvider(msalInstance),
	);

	const client = new OdspClient(clientProps);

	// create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.body.appendChild(app);
	const root = createRoot(app);

	// Initialize Fluid Container - this will either make a new container or load an existing one
	const { container } = await loadFluidData(containerId, containerSchema, client);

	// Initialize the SharedTree Data Structure
	const appData = (container.initialObjects.appData as ITree).schematize(
		treeConfiguration, // This is defined in schema.ts
	);

	// Initialize debugging tools
	initializeDevtools({
		logger: devtoolsLogger,
		initialContainers: [
			{
				container,
				containerKey: "My Container",
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
		const itemId = await container.attach();

		const shareId = await graphHelper.createSharingLink(
			clientProps.connection.driveId,
			itemId,
			"edit",
		);
		console.log("Link to the container: " + shareId);

		// The newly attached container is given a unique ID that can be used to access the container in another session.
		// This adds that id to the url.
		history.replaceState(undefined, "", "#" + shareId);
	}
}

start().catch((error) => console.error(error));
