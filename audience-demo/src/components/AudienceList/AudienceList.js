/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

import './AudienceList.css'

function AudienceList(data) {
    let member = data.data[1]
    let outlineColor = member.isSelf ? 'blue' : 'black'

    return (
        <div className="container" style={{outlineColor: outlineColor}}>
            <div className="subtitle">Name</div>
            <div>
                {member.userName}
            </div>
            <div className="subtitle">ID</div>
            <div>
                {member.userId};
            </div>
            <div className="subtitle">Connections</div>
            { 
                member.connections.map((data, key) => {
                    return (<div key={key}>{data.id}</div>);
                })
            }
            <div className="subtitle">Additional Details</div>
            { JSON.stringify(member.additionalDetails, null, '\t') }
        </div>
    );
}

export default AudienceList