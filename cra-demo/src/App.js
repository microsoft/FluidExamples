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

const timeKey = "time-key";

const getFluidObjects = async () => {
    let container;
    if (location.hash <= 1) {
        ({ container } = await client.createContainer(containerSchema));
        container.initialObjects.myMap.set(timeKey, Date.now().toString());
        const id = await container.attach();
        location.hash = id;
    } else {
        const id = location.hash.substring(1);
        ({ container } = await client.getContainer(id, containerSchema));
    }
    return container.initialObjects;
}

function App() {

    const [fluidObjects, setFluidObjects] = React.useState(undefined);
    React.useEffect(() => {
        getFluidObjects().then(objects => setFluidObjects(objects));
    }, []);

    const [viewData, setViewData] = React.useState(undefined);
    React.useEffect(() => {
        if (fluidObjects !== undefined) {
            const { myMap } = fluidObjects;
            const syncView = () => setViewData({ time: myMap.get(timeKey) });
            syncView();
            myMap.on("valueChanged", syncView);
            return () => { myMap.off("valueChanged", syncView) }
        }
    }, [fluidObjects])


    if (!viewData) return <div />;

    // business logic could be passed into the view via context
    const setTime = () => fluidObjects.myMap.set(timeKey, Date.now().toString());

    return (
        <div>
            <button onClick={setTime}> click </button>
            <span>{viewData.time}</span>
        </div>
    )
}

export default App;

