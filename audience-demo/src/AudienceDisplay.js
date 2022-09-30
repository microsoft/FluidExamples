/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

import { useEffect, useState } from "react";
import AudienceList from "./AudienceList";
import { useLocation } from 'react-router-dom';
import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider, generateTestUser } from "@fluidframework/test-client-utils"

let user = generateTestUser();

const userConfig = {
  id: undefined,
  name: user.name,
  additionalDetails: {
      "email": user.name.replace(/\s/g, '') + "@example.com",
      "date": new Date().toLocaleDateString("en-US")
  }
};

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

/**
 * Load the Fluid container and return the services object so that we can use it later
 */
const tryGetAudienceObject = async (userId, containerId) => {
    userConfig.id = userId
    let container;
    let services;
    if (!containerId) {
        ({ container, services } = await client.createContainer(containerSchema));
        const id = await container.attach();
        location.hash = id;
    } else {       
        ({ container, services } = await client.getContainer(containerId, containerSchema));
    }
    return services.audience;
};

function AudienceDisplay() {
    const location = useLocation();
    const selection = location.state;
    const userId = selection?.userId;
    const containerId = selection?.containerId;

    const [fluidMembers, setFluidMembers] = useState();
    const [currentMember, setCurrentMember] = useState();
  
    useEffect(() => {
        tryGetAudienceObject(userId, containerId).then(audience => {
  
          let members = audience.getMembers()
          let currentUser = audience.getMyself()
  
          setFluidMembers(members)
          setCurrentMember(currentUser)
  
          audience.on("membersChanged", () => {
            setFluidMembers(audience.getMembers())
            setCurrentMember(audience.getMyself())
          })
        });
    }, []);
  
  
    if (!fluidMembers || !currentMember) return <div />;
  
    return (
        <div>
          <AudienceList fluidMembers={fluidMembers} currentMember={currentMember}/>
        </div>
    )
}

export default AudienceDisplay