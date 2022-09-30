import AudienceListItem from "./AudienceListItem";

function AudienceList(data) {
    const currentMember = data.currentMember;
    const fluidMembers = data.fluidMembers;

    let list = [];
    fluidMembers.forEach((data, key) => {
        data.isSelf = (data.userId === currentMember.userId);
        list.push(<AudienceListItem data={data} key={key}/>);
    });

    return (
        <div>
            {list}
        </div>
    );
};

export default AudienceList