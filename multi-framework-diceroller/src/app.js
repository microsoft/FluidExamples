/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SharedMap } from "fluid-framework";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { jsRenderView as renderDiceRoller } from "./view";

export const diceValueKey = "dice-value-key";

const client = new TinyliciousClient();
const containerSchema = {
    initialObjects: { diceMap: SharedMap }
};
const root = document.getElementById("content");

const createNewDice = async () => {
    const { container } = await client.createContainer(containerSchema);
    container.initialObjects.diceMap.set(diceValueKey, 1);
    const id = container.attach();
    renderDiceRoller(container.initialObjects.diceMap, root);
    return id;
}

const loadExistingDice = async (id) => {
    const { container } = await client.getContainer(id, containerSchema);
    renderDiceRoller(container.initialObjects.diceMap, root);
}

async function start() {
    if (location.hash) {
        await loadExistingDice(location.hash.substring(1))
    } else {
        const id = await createNewDice();
        location.hash = id;
    }
}

start().catch((error) => console.error(error));


