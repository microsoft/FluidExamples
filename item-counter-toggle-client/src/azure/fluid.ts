/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { AzureClient, AzureContainerServices } from "@fluidframework/azure-client";
import { ContainerSchema, IFluidContainer, SharedTree } from "fluid-framework";
// import { clientProps } from "./clientProps";

// const client = new AzureClient(clientProps);

/**
 * This function will create a container if no container ID is passed on the hash portion of the URL.
 * If a container ID is provided, it will load the container.
 *
 * @returns The loaded container and container services.
 */
export async function loadFluidData<T extends ContainerSchema>(
	containerId: string,
	containerSchema: T,
	client: AzureClient,
): Promise<{
	services: AzureContainerServices;
	container: IFluidContainer<T>;
}> {
	let container: IFluidContainer<T>;
	let services: AzureContainerServices;

	// Get or create the document depending if we are running through the create new flow
	if (containerId.length === 0) {
		// The client will create a new detached container using the schema
		// A detached container will enable the app to modify the container before attaching it to the client
		({ container, services } = await client.createContainer(containerSchema));
	} else {
		// Use the unique container ID to fetch the container created earlier. It will already be connected to the
		// collaboration session.
		({ container, services } = await client.getContainer(containerId, containerSchema));
	}
	return { services, container };
}

export const containerSchema = {
	initialObjects: {
		appData: SharedTree,
	},
} satisfies ContainerSchema;
