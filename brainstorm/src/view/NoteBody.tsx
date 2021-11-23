import { TextField } from '@fluentui/react';
import React from 'react';
import {
  useNoteColor,
  useNoteLastModified,
  useNoteText,
} from '../brainstorm-hooks';
import { useMyself } from '../core/use-myself';
import { ColorOptions, DefaultColor } from '../Types';

export interface NoteBodyProps {
  noteId: string;
}

export function NoteBody(props: NoteBodyProps) {
  const { noteId } = props;
  const myself = useMyself();

  const [text, setText] = useNoteText(noteId);
  const [color] = useNoteColor(noteId);
  const [, setLastEdited] = useNoteLastModified(noteId);

  const c = color || DefaultColor;

  function onTextChange(ev: any) {
    setText(ev.currentTarget.value);
    setLastEdited({
      time: new Date().getTime(),
      userId: myself.userId,
      userName: myself.userName,
    });
  }

  return (
    <div style={{ flex: 1 }}>
      <TextField
        styles={{ fieldGroup: { background: ColorOptions[c].light } }}
        borderless
        multiline
        resizable={false}
        autoAdjustHeight
        onChange={onTextChange}
        value={text}
        placeholder={'Enter Text Here'}
      />
    </div>
  );
}
