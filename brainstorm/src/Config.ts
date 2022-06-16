import { AzureClientProps, AzureFunctionTokenProvider } from "@fluidframework/azure-client";
import { SharedMap } from "fluid-framework";
import { getRandomName } from "@fluidframework/server-services-client";
import { v4 as uuid } from 'uuid';
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";

export const useAzure = process.env.REACT_APP_FLUID_CLIENT === "azure";

export const containerSchema = {
    initialObjects: {
        map: SharedMap,
    },
}

export const userConfig = {
    id: uuid(),
    name: getRandomName(),
};

export const connectionConfig: AzureClientProps = useAzure ? { connection: {
    type: "remote",
    tokenProvider: new AzureFunctionTokenProvider("AZURE-FUNCTION-URL" + "/api/GetAzureToken", { userId: "test-user", userName: "Test User" }),
    endpoint: "ENTER-SERVICE-ENDPOINT-HERE", // REPLACE WITH YOUR SERVICE ENDPOINT
}} : { connection: {
    type: "local",
    tokenProvider: new InsecureTokenProvider("fooBar", userConfig),
    endpoint: "http://localhost:7070",
}} ;
