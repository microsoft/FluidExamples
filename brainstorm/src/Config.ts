import { FrsConnectionConfig, FrsAzFunctionTokenProvider, InsecureTokenProvider } from "@fluid-experimental/frs-client";
import { SharedMap } from "@fluid-experimental/fluid-framework";
import { generateUser } from "@fluidframework/server-services-client";

export const useFrs = process.env.REACT_APP_FLUID_CLIENT === "frs";

export const user = generateUser();

export const containerSchema = {
    name: "brainstorm",
    initialObjects: {
        map: SharedMap,
    },
}

export const connectionConfig: FrsConnectionConfig = useFrs ? {
    tenantId: "YOUR-TENANT-ID-HERE",
    tokenProvider: new FrsAzFunctionTokenProvider("AZURE-FUNCTION-URL"+"/api/GetFrsToken", { userId: "test-user", userName: "Test User" }),
    orderer: "ENTER-ORDERER-URL-HERE",
    storage: "ENTER-STORAGE-URL-HERE",
} : {
        tenantId: "local",
        tokenProvider: new InsecureTokenProvider("fooBar", user),
        orderer: "http://localhost:7070",
        storage: "http://localhost:7070",
    };