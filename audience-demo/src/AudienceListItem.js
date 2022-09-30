/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

export const AudienceListItem = (memberData) => {
    const member = memberData.data;
    const outlineColor = memberData.isSelf ? 'blue' : 'black';

    const subtitleStyle = {
        fontSize: 'large',
        fontWeight: 'bold',
        marginTop: '1rem',
    };

    const containerStyle = {
        padding: '2rem',
        margin: '2rem',
        display: 'flex',
        justifyContent: 'center',
        outline: 'solid',
        flexDirection: 'column',
        maxWidth: '50%',
        outlineColor
    };

    return (
        <div style={containerStyle}>
            <div style={subtitleStyle}>Name</div>
            <div>
                {member.userName}
            </div>
            <div style={subtitleStyle}>ID</div>
            <div>
                {member.userId}
            </div>
            <div style={subtitleStyle}>Connections</div>
            { 
                member.connections.map((data, key) => {
                    return (<div key={key}>{data.id}</div>);
                })
            }
            <div style={subtitleStyle}>Additional Details</div>
            { JSON.stringify(member.additionalDetails, null, '\t') }
        </div>
    );
};