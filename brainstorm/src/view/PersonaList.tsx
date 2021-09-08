import { IPersonaStyles, List, Persona, PersonaSize } from "@fluentui/react";
import { AzureMember } from "@fluidframework/azure-client";
import React from "react";

export function PersonaList(props: { users: AzureMember[] }) {
  const personaStyles: Partial<IPersonaStyles> = {
    root: {
      marginTop: 10,
    },
  };

  const renderPersonaListItem = (item?: AzureMember) => {
    return (
      item && (
        <Persona
          text={item.userName}
          size={PersonaSize.size24}
          styles={personaStyles}
        ></Persona>
      )
    );
  };
  return <List items={props.users} onRenderCell={renderPersonaListItem}></List>;
}
