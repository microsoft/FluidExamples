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

const useBrainstormData = (id, isNew) => {
  const [context, setContext] = useState(undefined);
  let defaultObject = undefined;
  useEffect(() => {
    // Create an scoped async function in the hook
    let container: Container | undefined;
    async function loadContainer() {
      try {
        const container = await getTinyliciousContainer(
          id,
          NoteroContainerFactory,
          isNew
        );
        defaultObject = await getDefaultObjectFromContainer<Notero>(container);
        setContext(defaultObject);
      } catch (e) {
        // Something went wrong
        // Navigate to Error page
      }
    }
    loadContainer();
    return () => {
      // If we are unloading and the Container has been generated we want to
      // close it to ensure we are not leaking memory
      if (container !== undefined) {
        container.close();
      }
    };
  }, []);
  return context;
};

export const LoadFluidContainer = (props: { new?: boolean }) => {
  const { id } = useParams();
  const history = useHistory();

  if (props.new) {
    history.replace(`/${id}`);
  }

  const context = useBrainstormData(id, props.new);

  return context ? (
    <FluidContext.Provider value={context}>
      <NoteroView />
    </FluidContext.Provider>
  ) : (
    <></>
  );
};
