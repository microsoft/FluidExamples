/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useEffect } from "react";
import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getTinyliciousContainer } from "@fluidframework/get-tinylicious-container";
import { Container } from "@fluidframework/container-loader";
import { FluidDraftJsObject } from "../fluid-object";
import { FluidDraftJsContainer } from "../containers";

export const useDraftJsData = (id, isNew) => {
    const [context, setContext] = useState(undefined);
    let defaultObject = undefined;
    useEffect(() => {
        // Create an scoped async function in the hook
        let container: Container | undefined;
        async function loadContainer() {
            try {
                const container = await getTinyliciousContainer(
                    id,
                    FluidDraftJsContainer,
                    isNew
                );
                defaultObject = await getDefaultObjectFromContainer<FluidDraftJsObject>(container);
                setContext(defaultObject);
            } catch (e) {
                // Something went wrong
                // Navigate to Error page
            }
        }
        loadContainer();
        return () => {
            // If we are unloading and the Container has been generated we want to
            // close it to ensure we are not leaking memory
            if (container !== undefined) {
                container.close();
            }
        };
    }, []);
    return context;
};
