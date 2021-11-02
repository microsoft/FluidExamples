import { SharedMap, IFluidContainer } from "fluid-framework";
import { AzureClient, AzureClientProps, LOCAL_MODE_TENANT_ID } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import * as process from "process";
import * as dotenv from "dotenv-webpack";

export const diceValueKey = "dice-value-key";
export const containerIdString = "containerId";
dotenv.config();
const containerSchema = {
    initialObjects: { diceMap: SharedMap }
};

const connectionConfig : AzureClientProps =
{
    connection: {
        tenantId: LOCAL_MODE_TENANT_ID,
        // tokenProvider: new InsecureTokenProvider("foobar", { id: "user" }),
        // orderer: "http://localhost:7070",
        // storage: "http://localhost:7070"
        tokenProvider: new InsecureTokenProvider(process.env.REACT_APP_TENANT_KEY as string, { id: "user" }),
        orderer: process.env.REACT_APP_ORDERER as string,
        storage: process.env.REACT_APP_STORAGE as string
    }
};
console.log("ab " + process.env.PACKAGE_NAME);

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
