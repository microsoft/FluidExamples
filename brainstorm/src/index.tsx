/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { FrsClient } from '@fluid-experimental/frs-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrainstormView } from './view/BrainstormView';
import "./view/index.css"
import "./view/App.css";
import { themeNameToTheme } from './view/Themes';
import { connectionConfig, containerSchema } from "./Config";

export async function start() {
    initializeIcons();

    const getContainerId = (): { containerId: string; isNew: boolean } => {
        let isNew = false;
        if (location.hash.length === 0) {
            isNew = true;
            location.hash = Date.now().toString();
        }
        const containerId = location.hash.substring(1);
        return { containerId, isNew };
    };

    const { containerId, isNew } = getContainerId();

    const client = new FrsClient(connectionConfig);

    const frsResources = isNew
        ? await client.createContainer({ id: containerId }, containerSchema)
        : await client.getContainer({ id: containerId }, containerSchema);


    if (!frsResources.fluidContainer.connected) {
        await new Promise<void>((resolve) => {
            frsResources.fluidContainer.once("connected", () => {
                resolve();
            });
        });
    }

    ReactDOM.render(
        <React.StrictMode>
            <ThemeProvider theme={themeNameToTheme("default")}>
                <BrainstormView frsResources={frsResources} />
            </ThemeProvider>
        </React.StrictMode>,
        document.getElementById('root')
    );
}

start().catch((error) => console.error(error));