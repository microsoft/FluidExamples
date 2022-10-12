/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useCallback } from "react";
import { AudienceDisplay } from "./AudienceDisplay";
import { UserIdSelection } from "./UserIdSelection"

export const App = () => {
  const [displayAudience, setDisplayAudience] = useState(false);
  const [userId, setUserId] = useState();
  const [containerId, setContainerId] = useState();

  const handleSelectUser = useCallback((userId, containerId) => {
    setDisplayAudience(true)
    setUserId(userId);
    setContainerId(containerId);
  }, [displayAudience, userId, containerId]);

  const handleContainerNotFound = useCallback(() => {
    setDisplayAudience(false)
  }, [setDisplayAudience]);

  return (
    (displayAudience) ? 
    <AudienceDisplay userId={userId} containerId={containerId} onContainerNotFound={handleContainerNotFound}/> :
    <UserIdSelection onSelectUser={handleSelectUser}/>
  );
};
