/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";


const client = new TinyliciousClient();

const containerSchema = {
    initialObjects: { myMap: SharedMap }
};

const dateKey = "date-key";

function App() {

    const [fluidData, setFluidData] = React.useState(undefined);
    React.useEffect(() => {
        const getFluidData = async () => {
            let container;
            if (location.hash <= 1) {
                ({ container } = await client.createContainer(containerSchema));
                container.initialObjects.myMap.set(dateKey, Date.now().toString());
                const id = await container.attach();
                location.hash = id;
            } else {
                const id = location.hash.substring(1);
                ({ container } = await client.getContainer(id, containerSchema));
            }
            return container.initialObjects;
        }
        getFluidData().then(data => setFluidData(data));
    }, []);

    const [viewData, setViewData] = React.useState(undefined);
    React.useEffect(() => {
        if (fluidData !== undefined) {
            const syncView = () => setViewData({ time: fluidData.myMap.get(dateKey) });
            syncView();
            fluidData.myMap.on("valueChanged", syncView);
            return () => { fluidData.myMap.off("valueChanged", syncView) }
        }
    }, [fluidData])


    if (!viewData) return <div />;

    // business logic could be passed into the view via context
    const setTime = () => fluidData.myMap.set(dateKey, Date.now().toString());

    return (
        <div>
            <button onClick={setTime}> click </button>
            <span>{viewData.time}</span>
        </div>
    )
}

export default App;

