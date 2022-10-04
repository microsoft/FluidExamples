/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useCallback } from "react";
import { AudienceDisplay } from "./AudienceDisplay";
import { SelectUser } from "./SelectUser"

export const App = () => {
  const [displayAudience, setDisplayAudience] = useState(false);
  const [userId, setUserId] = useState();
  const [containerId, setContainerId] = useState();

  const handleSelectUser = useCallback((userId, containerId) => {
    setDisplayAudience(true)
    setUserId(userId);
    setContainerId(containerId);
  });

  const handleContainerNotFound = useCallback(() => {
    setDisplayAudience(false)
  });

  return (
    (displayAudience) ? 
    <AudienceDisplay userId={userId} containerId={containerId} onContainerNotFound={handleContainerNotFound}/> :
    <SelectUser onSelectUser={handleSelectUser}/>
  );
};
