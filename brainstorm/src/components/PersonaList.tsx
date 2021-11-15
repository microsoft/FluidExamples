import { IPersonaStyles, List, Persona, PersonaSize } from '@fluentui/react';
import React from 'react';

export interface Persona {
  userId: string;
  userName: string;
}

export function PersonaList(props: { users: Persona[] }) {
  const renderPersonaListItem = (item?: Persona) => {
    return <PersonaItem persona={item}></PersonaItem>;
  };

  return <List items={props.users} onRenderCell={renderPersonaListItem}></List>;
}

function PersonaItem(props: { persona?: Persona }) {
  if (!props.persona) {
    return null;
  }

  const personaStyles: Partial<IPersonaStyles> = {
    root: {
      marginTop: 10,
    },
  };

  return (
    <Persona
      text={props.persona.userName}
      size={PersonaSize.size24}
      styles={personaStyles}
    ></Persona>
  );
}
