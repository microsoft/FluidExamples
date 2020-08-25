/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";
import { getTinyliciousContainer } from "@fluidframework/get-tinylicious-container";
import { Container } from "@fluidframework/container-loader";

import React, { useState, useEffect } from "react";

import { useParams, useHistory } from "react-router-dom";

import { Notero } from "../fluid-object";
import { NoteroContainerFactory } from "../container";
import { FluidContext } from "./FluidContext";
import { NoteroView } from "./NoteroView";

export const LoadFluidContainer = (props: { new?: boolean }) => {
  const [context, setContext] = useState(undefined);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    // Create an scoped async function in the hook
    let container: Container | undefined;
    async function loadContainer() {
      try {
        const container = await getTinyliciousContainer(
          id,
          NoteroContainerFactory,
          props.new
        );
        const defaultObject = await getDefaultObjectFromContainer<Notero>(
          container
        );
        if (props.new) {
          history.replace(`/${id}`);
        }
        setContext(defaultObject);
      } catch (e) {
        // Something went wrong
        // Navigate to Error page
      }
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
  return context ? (
    <FluidContext.Provider value={context}>
      <NoteroView />
    </FluidContext.Provider>
  ) : (
    <></>
  );
};
