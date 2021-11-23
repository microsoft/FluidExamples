import {
  IPersonaStyles,
  FontIcon,
  Persona,
  PersonaSize,
} from '@fluentui/react';
import { CSSProperties } from 'react';

interface MemberMouseCursorProps {
  userName: string;
  x: number;
  y: number;
}
export function MemberMouseCursor(props: MemberMouseCursorProps) {
  const style: CSSProperties = {
    left: props.x,
    top: props.y,
    position: 'absolute',
    zIndex: 2,
  };

  const iconStyle: CSSProperties = {
    transform: 'scale(-1, 1)',
  };

  const personaStyles: Partial<IPersonaStyles> = {
    root: {
      marginTop: -10,
      marginLeft: 10,
    },
  };

  return (
    <div style={style}>
      <FontIcon style={iconStyle} iconName="Rocket"></FontIcon>
      <Persona
        styles={personaStyles}
        text={props.userName}
        size={PersonaSize.size32}
        hidePersonaDetails={true}
      ></Persona>
    </div>
  );
}
