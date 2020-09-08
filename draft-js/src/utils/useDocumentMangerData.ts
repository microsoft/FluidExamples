/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useEffect } from "react";
import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getTinyliciousContainer } from "@fluidframework/get-tinylicious-container";
import { Container } from "@fluidframework/container-loader";
import { DocumentManager } from "../fluid-object";
import { DocumentManagerContainer } from "../containers";

const storageKey = "document-manager-key";

export const useDocumentManagerData = (): DocumentManager | undefined => {
    const [context, setContext] = useState(undefined);
    let defaultObject = undefined;
    useEffect(() => {
        // Create an scoped async function in the hook
        let container: Container | undefined;
        async function loadContainer() {
            try {
                // We need some way of knowing if this document has been created before
                // so we will use local storage as our source of truth
                let id = window.localStorage.getItem(storageKey);
                const isNew = id === null;
                if (isNew) {
                    id = Date.now().toString()
                    window.localStorage.setItem(storageKey, id);
                }
                const container = await getTinyliciousContainer(
                    id,
                    DocumentManagerContainer,
                    isNew
                );
                defaultObject = await getDefaultObjectFromContainer<DocumentManager>(container);
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
