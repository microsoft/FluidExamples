/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { AzureClient, InsecureTokenProvider } from "@fluid-experimental/frs-client";
import { SharedMap } from "@fluid-experimental/fluid-framework";

const localConfig = {
    tenantId: "local",
    tokenProvider: new InsecureTokenProvider("tenantKey", { id: "userId" }),
    orderer: "http://localhost:7070",
    storage: "http://localhost:7070",
};

const client = new AzureClient(localConfig);

const containerSchema = {
    initialObjects: { myMap: SharedMap }
};

const useFluidData = () => {
    const [fluidData, setFluidData] = React.useState();
    const createContainer = async () => {
        const { container } = await client.createContainer(containerSchema);
        const id = container.attach();
        setFluidData(container.initialObjects);
        return id;
    }
    const loadContainer = async (id) => {
        const { container } = await client.getContainer(id, containerSchema);
        setFluidData(container.initialObjects);
    }
    React.useEffect(async () => {
        if (!location.hash) {
            const id = await createContainer();
            location.hash = id;
        } else {
            const id = location.hash.substring(1);
            await loadContainer(id)
        }
    }, []);
    return fluidData
}

function App() {

    const { myMap } = useFluidData();
    const [viewData, setViewData] = React.useState();

    React.useEffect(() => {
        if (!myMap) return;

        // sync Fluid data into view state
        const syncView = () => setViewData({ time: myMap.get("time") });
        // ensure sync runs at least once
        syncView();
        // update state each time our map changes
        myMap.on("valueChanged", syncView);
        return () => { myMap.off("valueChanged", syncView) }

    }, [ myMap ])


    if (!viewData) return <div />;

    // business logic could be passed into the view via context
    const setTime = () => myMap.set("time", Date.now().toString());

    return (
        <div>
            <button onClick={setTime}> click </button>
            <span>{viewData.time}</span>
        </div>
    )
}

export default App;

