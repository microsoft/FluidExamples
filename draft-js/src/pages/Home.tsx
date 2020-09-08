/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";

import { Link, useHistory  } from "react-router-dom";

// import { getDocIds, storeNewDocId, clearAllIds } from "../utils";
import { useDocumentManagerData } from "../utils/useDocumentMangerData";
import { IDocumentManager } from "../fluid-object";

/**
 * This is a React function that renders the Home Page.
 * This page contains the following:
 * 1. A button for creating new docs
 * 2. A button to clear all docs
 * 3. A list of all existing docs
 */
export const Home = () => {
    const context = useDocumentManagerData();
    return (
        <>
            <h3>Documents</h3>
            { context ? <Loaded manager= {context} /> : <Loading /> }
        </>
    );
};

const Loading = () => {
    return <div>Loading...</div>
}

const Loaded = (props: {manager: IDocumentManager}) => {
    const [ids, setIds] = useState(props.manager.getAllDocIds());
    const history = useHistory();

    // Set a listener to update the ids when new ones change
    useEffect(() => {
        const setIdsInternal = () => {
            setIds(props.manager.getAllDocIds());
        };
        props.manager.on("ids-changed", setIdsInternal);

        return (() => {
            props.manager.off("ids-changed", setIdsInternal);
        });
    });

    const createNewDoc = () => {
        const newId = Date.now();
        props.manager.addDocument(newId.toString());
        history.push(`/createNew/${newId}`);
    };

    const clearIds = () => {
        props.manager.removeAllDocuments();
    };

    const idLinks: JSX.Element[] = [];
    ids.forEach((id) => {
        idLinks.push(
            <li key={id}>
                <Link to={`/${id}`}>{id}</Link>
            </li>
        );
    });

    return(
        <>
            <button onClick={() => createNewDoc() }>New Document</button>
            <span> </span>
            <button onClick={() => clearIds() }>Clear All Document</button>
            <ul>{idLinks}</ul>
        </>);
}
