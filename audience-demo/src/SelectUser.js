/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const SelectUser = () => {
    const selectStyle = {
      marginTop: '2rem',
      marginLeft: '2rem',
      width: '150px',
      height: '30px',
    };

    const [containerId, setContainerId] = useState();
    const navigate = useNavigate();

    const handleSubmit = (userId) => {
      navigate("/AudienceDisplay", { state: {userId, containerId} });
    }

    const handleChange = () => {
      setContainerId(document.getElementById("containerIdInput").value);
    };
  
    return (
      <div>
          <div style={selectStyle}>
            Enter Container Id:
            <input type="text" id="containerIdInput" onChange={() => handleChange()}></input>
          </div>
          {/* In the case of no ID in the containerIdInput: Select a User to create a new container and join as the selected user
              In the case of ID in the containerIdInput: Select a User to join container ID:[id] as the user */}
          <nav>
            <button type="submit" style={selectStyle} onClick={() => handleSubmit("user1")}>User 1</button>
            <button type="submit" style={selectStyle} onClick={() => handleSubmit("user2")}>User 2</button>
            <button type="submit" style={selectStyle} onClick={() => handleSubmit("random")}>Random User</button>
          </nav>
      </div>
    );
};