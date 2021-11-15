import { mergeStyles } from '@fluentui/react';
import React, { memo } from 'react';
import { useDrag } from 'react-dnd';
import { useNotePosition } from '../brainstorm-hooks';
import { DefaultColor } from '../Types';
import { getRootStyleForColor } from './Note.style';
import { NoteBody } from './NoteBody';
import { NoteFooter } from './NoteFooter';
import { NoteHeader } from './NoteHeader';

export interface NoteProps {
  id: string;
}

export function NoteComponent(props: NoteProps) {
  const { id } = props;

  const [position] = useNotePosition(id);
  const left = position?.x || 0;
  const top = position?.y || 0;

  const color = DefaultColor;
  const [, drag] = useDrag(
    () => ({
      type: 'note',
      item: { id, left, top },
    }),
    [id, left, top],
  );

  const rootClass = mergeStyles(getRootStyleForColor(color));

  return (
    <div className={rootClass} ref={drag} style={{ left, top }}>
      <NoteHeader noteId={id} />
      <NoteBody noteId={id} />
      <NoteFooter noteId={id} />
    </div>
  );
}

export const Note = memo(NoteComponent);
