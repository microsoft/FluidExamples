import { FluidContainer } from "@fluid-experimental/fluid-static";

export function getCurrentUser(container: FluidContainer) {
    
    if (!container.clientId) {
        console.log("The service hasn't acked you yet")
        return undefined;
    }

    return container.audience.getMember(container.clientId);
}

export function getHumanUsers(container: FluidContainer) {
    return Array.from(container.audience.getMembers().entries()).filter(([string, client]) => {
        console.log(client);
        if (client.details.capabilities.interactive) {
            return true;
        }
        return false
    }).map(([, client])=> client);
}