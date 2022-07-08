/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import "./App.css";
import { useState, useEffect } from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { ConnectionState, ContainerSchema, IFluidContainer, SharedString } from "fluid-framework";
import { CollaborativeTextArea } from "./CollaborativeTextArea";
import { SharedStringHelper } from "@fluid-experimental/react-inputs";

const useSharedString = (): SharedString => {
  const [sharedString, setSharedString] = useState<SharedString>();
  const getFluidData = async () => {
    // Configure the container.
    const client: TinyliciousClient = new TinyliciousClient();
    const containerSchema: ContainerSchema = {
      initialObjects: { sharedString: SharedString }
    }

    // Get the container from the Fluid service.
    let container: IFluidContainer;
    const containerId = window.location.hash.substring(1);
    if (!containerId) {
      ({ container } = await client.createContainer(containerSchema));
      const id = await container.attach();
      window.location.hash = id;
      // Return the Fluid SharedString object.
      return container.initialObjects.sharedString as SharedString;
    }

    ({ container } = await client.getContainer(containerId, containerSchema));
    if (container.connectionState !== ConnectionState.Connected) {
      await new Promise<void>((resolve) => {
        container.once("connected", () => {
          resolve();
        });
      });
    }
    // Return the Fluid SharedString object.
    return container.initialObjects.sharedString as SharedString;
  }

  // Get the Fluid Data data on app startup and store in the state
  useEffect(() => {
    getFluidData()
      .then((data) => setSharedString(data));
  }, []);

  return sharedString as SharedString;
}

function App() {
  // Load the collaborative SharedString object
  const sharedString = useSharedString();

  // Create the view using CollaborativeTextArea & SharedStringHelper
  if (sharedString) {
    return (
      <div className="app">
        <CollaborativeTextArea sharedStringHelper={new SharedStringHelper(sharedString)} />
      </div>
    );
  }
  else {
    return <div />;
  }
}

export default App;
