/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
/* eslint-disable no-restricted-globals */

import React, { useEffect, useState } from "react";
import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider, generateTestUser } from "@fluidframework/test-client-utils"
import AudienceList from './components/AudienceList/AudienceList'

let user = generateTestUser();
const userConfig = {
  id: user.id,
  name: user.name,
  additionalDetails: {
      "email": "email@microsoft.com",
      "date": new Date().toLocaleDateString("en-US")
  }
}

const serviceConfig = {
  connection: {
      type: "local",
      tokenProvider: new InsecureTokenProvider("" , userConfig),
      endpoint: "http://localhost:7070",
  }
};

const client = new AzureClient(serviceConfig);

const containerSchema = {
    initialObjects: { myMap: SharedMap }
};

const getMyMap = async () => {
    let container;
    let services
    const containerId = location.hash.substring(1);
    if (!containerId) {
        ({ container, services } = await client.createContainer(containerSchema));
        const id = await container.attach();
        location.hash = id;
    } else {       
        ({ container, services } = await client.getContainer(containerId, containerSchema));
    }
    return services.audience;
}

function App() {

    const [fluidMembers, setFluidMembers] = useState();

    useEffect(() => {
        getMyMap().then(audience => {
          let members = audience.getMembers()
          setFluidMembers(members)

          audience.on("membersChanged", () => {
            setFluidMembers(audience.getMembers())
          })
        });
    }, []);


    if (!fluidMembers) return <div />;

    let membersArray = Array.from(fluidMembers)

    return (
        <div>
          {
            membersArray.map((data, key) => {
              return (
                  <AudienceList data={data} key={key}/>
              );
            })
          }
        </div>
    )
}

export default App;

