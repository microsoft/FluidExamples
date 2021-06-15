/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { SharedMap } from "@fluidframework/map";
import { FluidContainer } from '@fluid-experimental/fluid-static';
import TinyliciousClient from '@fluid-experimental/tinylicious-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrainstormView } from './view/BrainstormView';
import { initializeIcons, ThemeProvider } from "@fluentui/react";
import "./view/index.css"
import "./view/App.css";
import { themeNameToTheme } from './view/Themes';

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

    const schema = {
        name: "brainstorm",
        initialObjects: {
            map: SharedMap,
        },
    }

    const { containerId, isNew } = getContainerId();

    TinyliciousClient.init({ port: 7070 });

    const fluidContainer = isNew
        ? await TinyliciousClient.createContainer({ id: containerId }, schema)
        : await TinyliciousClient.getContainer({ id: containerId }, schema);


    if (!fluidContainer.clientId) {
        await new Promise<void>((resolve) => {
            fluidContainer.once("connected", () => {
                resolve();
            });
        });
    }

    return fluidContainer
}

start()
    .then((fluidContainer: FluidContainer) => {
        ReactDOM.render(
            <React.StrictMode>
                <ThemeProvider theme={themeNameToTheme("default")}>
                    <BrainstormView fluid={fluidContainer} />
                </ThemeProvider>
            </React.StrictMode>,
            document.getElementById('root')
        );
    })
