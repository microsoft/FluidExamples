import * as React from "react";
import { SharedMap } from "fluid-framework";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { FluidContent } from "./FluidContent";
import { getContainer, containerIdString } from "./Util";

/**
 * Implementation of the HelloWorldTab content page
 */
export const HelloWorldTab = () => {

    microsoftTeams.initialize();
    const [{ inTeams, theme, context }] = useTeams();

    const [fluidMap, setFluidMap] = useState<SharedMap | undefined>(undefined);

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.appInitialization.notifySuccess();
        }
    }, [inTeams]);

    const getFluidMap = (url : URLSearchParams) => {
        const containerId = url.get(containerIdString);
        if (!containerId) {
            throw Error("containerId not found in the URL");
        }
        getContainer(containerId).then((container) => {
            const diceMap = container.initialObjects.diceMap as SharedMap;
            setFluidMap(diceMap);
        });
    };

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.settings.getSettings(async (instanceSettings) => {
                const url = new URLSearchParams(instanceSettings.contentUrl);
                getFluidMap(url);
            });
        } else {
            const url = new URLSearchParams(window.location.search);
            getFluidMap(url);
        }
    }, [inTeams]);

    if (fluidMap !== undefined) {
        return (
            <FluidContent fluidMap={fluidMap} />
        );
    }

    return (
        <div>Loading FluidContent...</div>
    );

};
