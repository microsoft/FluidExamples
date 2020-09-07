/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    DataObject,
    DataObjectFactory,
} from "@fluidframework/aqueduct";
import {
    IDirectory,
    IDirectoryValueChanged,
} from "@fluidframework/map";

const documentsKey = "documents-key";
const idsChangedEventKey = "ids-changed";

export interface IDocumentManager {
    addDocument(id: string): void;
    removeDocument(id: string): void;
    removeAllDocuments(): void;
    getAllDocIds(): string[];
    on(event: typeof idsChangedEventKey, listener: () => void): this;
    off(event: typeof idsChangedEventKey, listener: () => void): this;
}

export class DocumentManager extends DataObject implements IDocumentManager {
    public static get Name() { return "@fluid-example/document-manager"; }

    private documents: IDirectory | undefined;

    public static readonly factory = new DataObjectFactory(
        DocumentManager.Name,
        DocumentManager,
        [],
        {},
    );

    /**
     * Do setup work here
     */
    protected async initializingFirstTime() {
        // We'll use a sub-directory to store our keys
        this.root.createSubDirectory(documentsKey)
    }

    protected async hasInitialized() {
        this.documents = this.root.getSubDirectory(documentsKey);
        this.root.on("valueChanged", (changed: IDirectoryValueChanged) => {
            if (changed.path === `/${documentsKey}`) {
                this.emit(idsChangedEventKey);
            }
        });

        this.root.on("clear", () => {
            this.emit(idsChangedEventKey);
        });
    }

    public addDocument(id: string): void {
        this.documents.set(id, "");
    }

    public removeDocument(id: string) {
        this.documents.delete(id);
    }

    public removeAllDocuments(): void {
        this.documents.clear();
    }

    public getAllDocIds(): string[] {
        return Array.from(this.documents.keys());
    }
}
