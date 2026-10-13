/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type {
	AzureRemoteConnectionConfig,
	AzureClientProps,
	AzureLocalConnectionConfig,
	ITelemetryBaseLogger,
} from "@fluidframework/azure-client";
// This test-only provider is used exclusively with the local development relay.
import { InsecureTokenProvider } from "@fluidframework/test-runtime-utils/internal";
import { AzureFunctionTokenProvider } from "./azureTokenProvider.js";
import type { UserInfo } from "../../presence/Interfaces/UsersManager.js";

const client = process.env.FLUID_CLIENT;
const local = client === undefined || client === "local";
if (local) {
	console.info("Configured to use the local Azure Fluid service.");
}

export function getClientProps(user: UserInfo, logger?: ITelemetryBaseLogger): AzureClientProps {
	const localConnectionConfig: AzureLocalConnectionConfig = {
		type: "local",
		tokenProvider: new InsecureTokenProvider("VALUE_NOT_USED", user),
		endpoint: "http://localhost:7070",
	};
	if (!local) {
		for (const [name, value] of Object.entries({
			AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
			AZURE_FUNCTION_TOKEN_PROVIDER_URL: process.env.AZURE_FUNCTION_TOKEN_PROVIDER_URL,
			AZURE_ORDERER: process.env.AZURE_ORDERER,
		})) {
			if (!value) throw new Error(`Missing Azure configuration: ${name}`);
		}
	}
	const remoteConnectionConfig: AzureRemoteConnectionConfig = {
		type: "remote",
		tenantId: process.env.AZURE_TENANT_ID!,
		tokenProvider: new AzureFunctionTokenProvider(
			process.env.AZURE_FUNCTION_TOKEN_PROVIDER_URL!,
			user
		),
		endpoint: process.env.AZURE_ORDERER!,
	};

	const connectionConfig: AzureRemoteConnectionConfig | AzureLocalConnectionConfig = !local
		? remoteConnectionConfig
		: localConnectionConfig;

	return {
		connection: connectionConfig,
		logger,
	};
}
