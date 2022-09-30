/*!
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
*/

import { AudienceListItem } from "./AudienceListItem";

export const AudienceList = (data) => {
    const currentMember = data.currentMember;
    const fluidMembers = data.fluidMembers;

    const list = [];
    fluidMembers.forEach((data, key) => {
        const isSelf = (data.userId === currentMember.userId);
        list.push(<AudienceListItem data={data} key={key} isSelf={isSelf}/>);
    });

    return (
        <div>
            {list}
        </div>
    );
};