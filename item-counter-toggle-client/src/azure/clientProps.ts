/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	AzureRemoteConnectionConfig,
	AzureClientProps,
	AzureLocalConnectionConfig,
} from "@fluidframework/azure-client";
import {
	AzureFunctionTokenProvider,
	azureUser,
	InsecureTokenProvider,
	user,
} from "./tokenProvider.js";

const useAzure = process.env.FLUID_CLIENT === "azure";
if (!useAzure) {
	console.warn(`Configured to use local tinylicious.`);
}

const remoteConnectionConfig: AzureRemoteConnectionConfig = {
	type: "remote",
	tenantId: process.env.AZURE_TENANT_ID!,
	tokenProvider: new AzureFunctionTokenProvider(
		process.env.AZURE_FUNCTION_TOKEN_PROVIDER_URL!,
		azureUser,
	),
	endpoint: process.env.AZURE_ORDERER!,
};

const localConnectionConfig: AzureLocalConnectionConfig = {
	type: "local",
	tokenProvider: new InsecureTokenProvider("VALUE_NOT_USED", user),
	endpoint: "http://localhost:7070",
};

const connectionConfig: AzureRemoteConnectionConfig | AzureLocalConnectionConfig = useAzure
	? remoteConnectionConfig
	: localConnectionConfig;
export const clientProps: AzureClientProps = {
	connection: connectionConfig,
};
