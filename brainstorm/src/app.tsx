/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { App } from "./views";

// Render the content using ReactDOM
ReactDOM.render(
    <HashRouter>
        <App/>
    </HashRouter>,
    document.getElementById("content"));
