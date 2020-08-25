/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// We need to store our generated IDS somewhere so that we can use them later.
// Here we are simply just storing them into Local Storage but you probably want to
// persist them into a place that is more shared. Ex. some database.

// You could use another Fluid Framework Container for this but it's not recommended since it's overkill
// for what you are trying to do.

const storageKey = "brainstorm-set";

export const storeNewDocId = (newId: string) => {
    // This is using localStorage but you probably want to have another way
    // To store and get these items
    const current = window.localStorage.getItem(storageKey);
    // eslint-disable-next-line no-null/no-null
    const items = current !== null ? current.split(",") : [];
    items.push(newId);
    window.localStorage.setItem(storageKey, items.toString());
};

export const clearAllIds = () => {
    window.localStorage.removeItem(storageKey);
};

export const getDocIds = (): string[] => {
    const items = window.localStorage.getItem(storageKey);
    // eslint-disable-next-line no-null/no-null
    return items !== null ? items.split(",") : [];
};
