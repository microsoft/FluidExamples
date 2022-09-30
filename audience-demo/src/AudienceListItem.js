/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

function AudienceListItem(memberData) {
    let member = memberData.data;
    let outlineColor = member.isSelf ? 'blue' : 'black';

    const subtitle = {
        fontSize: 'large',
        fontWeight: 'bold',
        marginTop: '1rem',
    }

    const container = {
        padding: '2rem',
        margin: '2rem',
        display: 'flex',
        justifyContent: 'center',
        outline: 'solid',
        flexDirection: 'column',
        maxWidth: '50%',
        outlineColor: outlineColor
    }

    return (
        <div style={container}>
            <div style={subtitle}>Name</div>
            <div>
                {member.userName}
            </div>
            <div style={subtitle}>ID</div>
            <div>
                {member.userId};
            </div>
            <div style={subtitle}>Connections</div>
            { 
                member.connections.map((data, key) => {
                    return (<div key={key}>{data.id}</div>);
                })
            }
            <div style={subtitle}>Additional Details</div>
            { JSON.stringify(member.additionalDetails, null, '\t') }
        </div>
    );
}

export default AudienceListItem