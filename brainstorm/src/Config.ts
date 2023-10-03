import {
	AzureClientProps,
	AzureLocalConnectionConfig,
	AzureRemoteConnectionConfig,
} from "@fluidframework/azure-client";
import { SharedMap } from "fluid-framework";
import { getRandomName } from "@fluidframework/server-services-client";
import { v4 as uuid } from "uuid";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { AzureFunctionTokenProvider } from "./AzureFunctionTokenProvider";

export const useAzure = process.env.REACT_APP_FLUID_CLIENT === "azure";

export const containerSchema = {
	initialObjects: {
		map: SharedMap,
	},
};

const userConfig = {
	id: uuid(),
	name: getRandomName(),
};

const azureUserConfig = {
	userId: uuid(),
	userName: getRandomName(),
};

const remoteConnectionConfig: AzureRemoteConnectionConfig = {
	type: "remote",
	tenantId: "", // REPLACE WITH YOUR TENANT ID
	tokenProvider: new InsecureTokenProvider("" /* REPLACE WITH YOUR PRIMARY KEY */, userConfig),
	endpoint: "", // REPLACE WITH YOUR AZURE ENDPOINT
};

const localConnectionConfig: AzureLocalConnectionConfig = {
	type: "local",
	tokenProvider: new InsecureTokenProvider("", userConfig),
	endpoint: "http://localhost:7070",
};

export const connectionConfig: AzureClientProps = {
	connection: useAzure ? remoteConnectionConfig : localConnectionConfig,
};
