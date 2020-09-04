/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";

import { Link, useHistory } from "react-router-dom";

import { getDocIds, storeNewDocId, clearAllIds } from "../utils";

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
    idLinks.push(
      <li key={id}>
        <Link to={`/${id}`}>{id}</Link>
      </li>
    );
  });

  return (
    <>
      <h3>Documents</h3>
      <button onClick={() => createNewDoc()}>New Document</button>
      <span> </span>
      <button onClick={() => clearIds()}>Clear All Document</button>
      <ul>{idLinks}</ul>
    </>
  );
};
