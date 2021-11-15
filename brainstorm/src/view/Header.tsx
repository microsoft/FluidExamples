import {
  CommandBar,
  ICommandBarItemProps,
  IContextualMenuRenderItem,
  IRefObject,
  Text,
} from '@fluentui/react';
import React from 'react';
import { useCreateNewNote } from '../brainstorm-hooks';
import { ColorPicker } from '../components/ColorPicker';
import { ColorId, DefaultColor } from '../Types';
import { HeaderPersonas } from './HeaderPersonas';
import { NOTE_SIZE } from './Note.style';

export function Header() {
  const colorButtonRef = React.useRef<any>();
  const [color, setColor] = React.useState(DefaultColor);

  const createNewNote = useCreateNewNote(color, () => {
    const { scrollHeight, scrollWidth } = document.getElementById('NoteSpace')!;
    const position = {
      x: Math.floor(Math.random() * (scrollWidth - NOTE_SIZE.width)),
      y: Math.floor(Math.random() * (scrollHeight - NOTE_SIZE.height)),
    };
    return position;
  });

  const items = [
    createLogo(),
    createNewNoteButton(createNewNote),
    createDefaultColorPicker(color, setColor, colorButtonRef),
  ];

  const farItems = [createPersonasBarItem()];

  return (
    <CommandBar
      styles={{ root: { paddingLeft: 0 } }}
      items={items}
      farItems={farItems}
    />
  );
}

function createLogo(): ICommandBarItemProps {
  return {
    key: 'title',
    onRender: () => (
      <Text
        variant="xLarge"
        styles={{
          root: { alignSelf: 'center', marginBottom: 6, marginRight: 16 },
        }}
      >
        Let's Brainstorm
      </Text>
    ),
  };
}

function createNewNoteButton(onClick: () => void): ICommandBarItemProps {
  return {
    key: 'add',
    text: 'Add note',
    onClick,
    iconProps: {
      iconName: 'QuickNote',
    },
  };
}

function createDefaultColorPicker(
  color: ColorId,
  onSetColor: (v: ColorId) => void,
  componentRef: IRefObject<IContextualMenuRenderItem>,
): ICommandBarItemProps {
  return {
    componentRef: componentRef,
    key: 'color',
    text: 'Default Color',
    iconProps: {
      iconName: 'Color',
    },
    subMenuProps: {
      key: 'color-picker',
      items: [{ key: 'foo' }],
      onRenderMenuList: () => (
        <ColorPicker
          parent={componentRef}
          selectedColor={color}
          setColor={onSetColor}
        />
      ),
    },
  };
}

function createPersonasBarItem(): ICommandBarItemProps {
  return {
    key: 'presence',
    onRender: () => <HeaderPersonas />,
  };
}


