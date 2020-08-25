/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";

import {
    Link,
    useHistory,
  } from "react-router-dom";

import { getDocIds, storeNewDocId, clearAllIds } from "../externalStorageHelpers";

/**
 * This is a React function that renders the Home Page.
 * This page contains the following:
 * 1. A button for creating new docs
 * 2. A button to clear all docs
 * 3. A list of all existing docs
 */
export const Home = () => {
    const [ids, setIds] = useState(getDocIds());
    const history = useHistory();

    const createNewDoc = () => {
        const newId = Date.now();
        storeNewDocId(newId.toString());
        setIds(getDocIds());
        history.push(`/createNew/${newId}`);
    };

    const clearIds = () => {
        clearAllIds();
        setIds(getDocIds());
    };

    // Generate a list of all the current IDs
    const idLinks: JSX.Element[] = [];
    ids.forEach((id) => {
        idLinks.push((
        <li key={id} >
            <Link to={`/${id}`}>
                {id}
            </Link>
        </li>));
    });

    return (
        <>
            <h1>Home</h1>
            <div>
                <button onClick={ () => createNewDoc() }>
                    New Document
                </button>
            </div>
            <br/>
            <div>
                <button onClick={ () => clearIds() }>
                    Clear All Ids
                </button>
            </div>
            <ul>
                {idLinks}
            </ul>
        </>
    );
};
