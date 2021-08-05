import { FrsConnectionConfig, InsecureTokenProvider } from "@fluid-experimental/frs-client";
import { SharedMap } from "@fluidframework/map";
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
    tenantId: '',
    tokenProvider: new InsecureTokenProvider('', user),
    orderer: '',
    storage: '',

} : {
        tenantId: "local",
        tokenProvider: new InsecureTokenProvider("fooBar", user),
        orderer: "http://localhost:7070",
        storage: "http://localhost:7070",
    };