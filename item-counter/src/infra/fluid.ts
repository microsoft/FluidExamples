/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	AzureClient,
	AzureContainerServices,
	type ITelemetryBaseLogger,
} from "@fluidframework/azure-client";
import { ContainerSchema, IFluidContainer, SharedTree } from "fluid-framework";
import { getClientProps } from "./clientProps.js";

async function initializeClient(): Promise<{
	client: AzureClient;
	telemetryLogger: ITelemetryBaseLogger | undefined;
}> {
	// Initialize Devtools logger if in development mode
	let telemetryLogger: ITelemetryBaseLogger | undefined;
	if (process.env.NODE_ENV === "development") {
		const { createDevtoolsLogger } = await import("@fluidframework/devtools/beta");
		telemetryLogger = createDevtoolsLogger();
	}

	const clientProps = getClientProps(telemetryLogger);
	const client = new AzureClient(clientProps);
	return { client, telemetryLogger };
}

/**
 * This function will create a container if no container ID is passed on the hash portion of the URL.
 * If a container ID is provided, it will load the container.
 *
 * @returns The loaded container and container services.
 */
export async function loadFluidData<T extends ContainerSchema>(
	containerId: string,
	containerSchema: T,
): Promise<{
	services: AzureContainerServices;
	container: IFluidContainer<T>;
}> {
	const { client, telemetryLogger } = await initializeClient();

	let container: IFluidContainer<T>;
	let services: AzureContainerServices;

	// Get or create the document depending if we are running through the create new flow
	if (containerId.length === 0) {
		// The client will create a new detached container using the schema
		// A detached container will enable the app to modify the container before attaching it to the client
		({ container, services } = await client.createContainer(containerSchema, "2"));
	} else {
		// Use the unique container ID to fetch the container created earlier. It will already be connected to the
		// collaboration session.
		({ container, services } = await client.getContainer(containerId, containerSchema, "2"));
	}

	// Initialize Devtools
	if (process.env.NODE_ENV === "development") {
		const { initializeDevtools } = await import("@fluidframework/devtools/beta");
		initializeDevtools({
			initialContainers: [{ containerKey: "Item-Counter Container", container }],
			logger: telemetryLogger,
		});
	}

	return { services, container };
}

export const containerSchema = {
	initialObjects: {
		appData: SharedTree,
	},
} satisfies ContainerSchema;
