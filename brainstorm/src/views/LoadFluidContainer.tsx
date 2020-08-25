/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getTinyliciousContainer } from "@fluidframework/get-tinylicious-container";
import { Container } from "@fluidframework/container-loader";

import React, { useState, useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { Notero } from "../fluid-object";
import { NoteroContainerFactory } from "../container";
import { FluidContext } from "./FluidContext";
import { NoteroView } from "./NoteroView";

/**
 * This is a React function that loads a Fluid Container based off the react-router ID.
 *
 * 1. Loads a Fluid Container based in the react-router id
 * 2. Loads the default FluidObject in the Fluid Container
 * 3. Creates a FluidContext.Provider with the default FluidObject
 * 4. Renders the PrettyDiceRollerView
 *
 */
export const LoadFluidContainer = () => {
    const [view, setView] = useState(<div></div>);
    const { id } = useParams();
    const createNew = new URLSearchParams(useLocation().search).get("createNew") ? true : false;
    
    useEffect(() => {
      // Create an scoped async function in the hook
      let container: Container | undefined;
      async function loadContainer() {
        const container = await getTinyliciousContainer(id, NoteroContainerFactory, createNew);
        const defaultObject = await getDefaultObjectFromContainer<Notero>(container);
        setView((
            <FluidContext.Provider value = {defaultObject}>
                <NoteroView/>
            </FluidContext.Provider>
        ));
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      loadContainer();
      return () => {
          // If we are unloading and the Container has been generated we want to
          // close it to ensure we are not leaking memory
          if (container !== undefined) {
              container.close();
          }
      };
    }, []);
  return view;
};
