/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct";
import { SharedString } from "@fluidframework/sequence";
import { IFluidHandle } from "@fluidframework/core-interfaces";

/**
 * CollaborativeText uses the React CollaborativeTextArea to load a collaborative HTML <textarea>
 */
export class CollaborativeText extends DataObject {
    private readonly textKey = "textKey";

    text: SharedString | undefined;

    public static get Name() { return "collaborative-textarea"; }

    private static readonly factory = new DataObjectFactory(
        CollaborativeText.Name,
        CollaborativeText,
        [
            SharedString.getFactory(),
        ],
        {},
    );

    public static getFactory() { return this.factory; }

    protected async initializingFirstTime() {
        // Create the SharedString and store the handle in our root SharedDirectory
        const text = SharedString.create(this.runtime);
        this.root.set(this.textKey, text.handle);
    }

    protected async hasInitialized() {
        // Store the text if we are loading the first time or loading from existing
        this.text = await this.root.get<IFluidHandle<SharedString>>(this.textKey).get();
    }

}

// Export the CollaborativeText factory as fluidExport for the dynamic component loading scenario
export const CollaborativeTextInstantiationFactory = CollaborativeText.getFactory();
