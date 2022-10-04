/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

import { useEffect, useState } from "react";
import { AudienceList } from "./AudienceList";
import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"

/**
 * Load the Fluid container and return the services object so that we can use it later
 */
const tryGetAudienceObject = async (userId, userName, containerId) => {
    const userConfig = {
      id: userId,
      name: userName,
      additionalDetails: {
          "email": userName.replace(/\s/g, '') + "@example.com",
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

    let container;
    let services;
    if (!containerId) {
        ({ container, services } = await client.createContainer(containerSchema));
        const id = await container.attach();
        location.hash = id;
    } else { 
        try {
            ({ container, services } = await client.getContainer(containerId, containerSchema));
        } catch(e) {
            return;
        }      
    }
    return services.audience;
};

export const AudienceDisplay = (props) => {
    const userId = props.userId == "random" ? Math.random() : props.userId;
    const userNameList = {
      "user1" : "User One",
      "user2" : "User Two",
      "random" : "Random User"
    };
    const userName = userNameList[props.userId];

    const [fluidMembers, setFluidMembers] = useState();
    const [currentMember, setCurrentMember] = useState();
  
    useEffect(() => {
        tryGetAudienceObject(userId, userName, props.containerId).then(audience => {
          if(!audience) {
            props.onContainerNotFound();
            alert("error: container id not found.");
            return;
          }

          const members = audience.getMembers();
          const currentUser = audience.getMyself();
  
          setFluidMembers(members);
          setCurrentMember(currentUser);
  
          audience.on("membersChanged", () => {
            setFluidMembers(audience.getMembers());
            setCurrentMember(audience.getMyself());
          });
        });
    }, []);
  
    if (!fluidMembers || !currentMember) return (<div/>);
    
    return (
        <div>
          <AudienceList fluidMembers={fluidMembers} currentMember={currentMember}/>
        </div>
    )
}