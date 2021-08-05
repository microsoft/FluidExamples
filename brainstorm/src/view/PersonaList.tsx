import {
  IPersonaStyles,
  List,
  Persona,
  PersonaSize,
} from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import React from "react";

export type PersonaListProps = {
  users: FrsMember[];
};
export function PersonaList(props: PersonaListProps) {
  const personaStyles: Partial<IPersonaStyles> = {
    root: {
      marginTop: 10,
    },
  };

  const renderPersonaListItem = (item?: FrsMember) => {
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
  return (
    <List
      items={props.users}
      onRenderCell={renderPersonaListItem}
    ></List>
  );
}
