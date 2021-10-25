/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import "./App.css";
import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedString } from "fluid-framework";
import { CollaborativeTextArea } from "./CollaborativeTextArea";
import { SharedStringHelper } from "./SharedStringHelper";

const client = new TinyliciousClient();
const containerSchema = {
  initialObjects: { sharedString: SharedString }
}

function App() {

  const [sharedString, setSharedString] = React.useState();

  const getFluidData = async () => {
    let container;
    const containerId = window.location.hash.substring(1);
    if (!containerId) {
      container = (await client.createContainer(containerSchema)).container;
      const id = await container.attach();
      window.location.hash = id;
    } else {
      container = (await client.getContainer(containerId, containerSchema)).container;
    }
    return container.initialObjects.sharedString;
  }

  React.useEffect(() => {
    getFluidData()
      .then(data => setSharedString(data));
  }, []);


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
