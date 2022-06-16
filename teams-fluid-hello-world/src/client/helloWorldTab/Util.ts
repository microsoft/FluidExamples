/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { SharedMap, IFluidContainer } from "fluid-framework";
import { AzureClient, AzureClientProps } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";

export const diceValueKey = "dice-value-key";
export const containerIdQueryParamKey = "containerId";

const containerSchema = {
    initialObjects: { diceMap: SharedMap }
};

const connectionConfig : AzureClientProps =
{
    connection: {
        type: "local", // YOUR-TENANT-ID-HERE
        tokenProvider: new InsecureTokenProvider("foobar", { id: "user" }), // ENTER YOUR-TENANT-KEY-HERE
        endpoint: "http://localhost:7070", // ENTER ENDPOINT_URL-HERE
    }
};

const client = new AzureClient(connectionConfig);

export async function createContainer() : Promise<string> {
    const { container } = await client.createContainer(containerSchema);
    const diceMap = container.initialObjects.diceMap as SharedMap;
    diceMap.set(diceValueKey, 1);
    const containerId = await container.attach();
    return containerId;
};

export async function getContainer(id : string) : Promise<IFluidContainer> {
    const { container } = await client.getContainer(id, containerSchema);
    return container;
};
