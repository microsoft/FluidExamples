import {
  IFacepilePersona,
  IPersonaStyles,
  List,
  Persona,
  PersonaSize,
} from "@fluentui/react";
import React from "react";
import { IUser } from "../utils";

export type PersonaListProps = {
  users: IUser[];
};
export function PersonaList(props: PersonaListProps) {
  const [userPhotos, setUserPhotos] = React.useState<
    Map<string, IFacepilePersona>
  >(new Map<string, IFacepilePersona>());


  const personaStyles: Partial<IPersonaStyles> = {
    root: {
      marginTop: 10,
    },
  };

  const renderPersonaListItem = (item?: IFacepilePersona) => {
    return (
      item && (
        <Persona
          text={item.personaName}
          imageUrl={item.imageUrl}
          size={PersonaSize.size24}
          styles={personaStyles}
        ></Persona>
      )
    );
  };
  return (
    <List
      onRenderCell={renderPersonaListItem}
    ></List>
  );
}
