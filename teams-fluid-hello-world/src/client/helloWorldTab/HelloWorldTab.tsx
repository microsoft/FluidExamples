/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as React from "react";
import { SharedMap } from "fluid-framework";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { FluidContent } from "./FluidContent";
import { getContainer, containerIdQueryParamKey } from "./Util";

/**
 * Implementation of the HelloWorldTab content page
 */
export const HelloWorldTab = () => {
  microsoftTeams.initialize();
  const [{ inTeams }] = useTeams();

  const [fluidMap, setFluidMap] = useState<SharedMap | undefined>(undefined);

  const getFluidMap = async (url: URLSearchParams) => {
    const containerId = url.get(containerIdQueryParamKey);
    if (!containerId) {
      throw Error("containerId not found in the URL");
    }
    const container = await getContainer(containerId);
    const diceMap = container.initialObjects.diceMap as SharedMap;
    setFluidMap(diceMap);
  };

  useEffect(() => {
    if (inTeams === true) {
      microsoftTeams.settings.getSettings(async (instanceSettings) => {
        const url = new URL(instanceSettings.contentUrl);
        getFluidMap(url.searchParams);
      });
      microsoftTeams.appInitialization.notifySuccess();
    }
  }, [inTeams]);

  if (inTeams === false) {
    return (
      <div>This application only works in the context of Microsoft Teams</div>
    );
  }

  if (fluidMap !== undefined) {
    return <FluidContent fluidMap={fluidMap} />;
  }

  return <div>Loading FluidContent...</div>;
};
