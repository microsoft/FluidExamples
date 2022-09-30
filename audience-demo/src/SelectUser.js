/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

import { Link } from 'react-router-dom';
import { useState } from 'react';

function SelectUser() {
    const select = {
      marginTop: '2rem',
      marginLeft: '2rem',
      width: '150px',
      height: '30px',
    }

    const [containerId, setContainerId] = useState();
    

    const handleChange = () => {
      setContainerId(document.getElementById("containerIdInput").value);
    }
  
    return (
      <div>
          <div style={select}>
            Enter Container Id:
            <input type="text" id="containerIdInput" onChange={() => handleChange()}></input>
          </div>
          <nav>
            <button type="submit" style={select}>
              <Link to="/AudienceDisplay" state={{ userId: 'user1', containerId: containerId }}>User 1</Link>
            </button>
            <button type="submit" style={select}>
              <Link to="/AudienceDisplay" state={{ userId: 'user2', containerId: containerId }}>User 2</Link>
            </button>
            <button type="submit" style={select}>
              <Link to="/AudienceDisplay" state={{ userId: 'random', containerId: containerId }}>Random User</Link>
            </button>
          </nav>
      </div>
    )
}

export default SelectUser