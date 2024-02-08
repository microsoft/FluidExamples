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
						scopes: ["FileStorageContainer.Selected"],
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

async function signedInStart(msalInstance: PublicClientApplication, account: AccountInfo) {
	msalInstance.setActiveAccount(account);

	const graphHelper = new GraphHelper(msalInstance, account);

	const clientProps = getClientProps(
		await graphHelper.getSiteUrl(),
		await graphHelper.getFileStorageContainerId(),
		new OdspTestTokenProvider(msalInstance),
	);

	const client = new OdspClient(clientProps);

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
		containerId = await container.attach();

		// The newly attached container is given a unique ID that can be used to access the container in another session.
		// This adds that id to the url.
		history.replaceState(undefined, "", "#" + containerId);
	}
}

start().catch((error) => console.error(error));
