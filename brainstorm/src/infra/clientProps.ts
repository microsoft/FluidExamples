/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	AzureRemoteConnectionConfig,
	AzureClientProps,
	AzureLocalConnectionConfig,
} from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "./tokenProvider.js";
import { AzureFunctionTokenProvider, azureUser, user } from "./tokenProvider.js";
import { createDevtoolsLogger } from "@fluidframework/devtools/beta";

// Instantiate the logger
export const devtoolsLogger = createDevtoolsLogger();

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
	logger: devtoolsLogger,
};
