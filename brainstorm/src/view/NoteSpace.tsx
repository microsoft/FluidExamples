import { IStyle, mergeStyles, ThemeProvider } from '@fluentui/react';
import React from 'react';
import { useDrop } from 'react-dnd';
import {
  useNotDeletedNotes,
  useSetNotePositionById,
} from '../brainstorm-hooks';
import { useFluidContext } from '../core/use-fluid-context';
import { lightTheme } from '../Themes';
import { Note } from './Note';

export function NoteSpace() {
  const { sharedMap } = useFluidContext();

  const noteIds = useNotDeletedNotes();
  const setNotePosition = useSetNotePositionById();

  const rootStyle: IStyle = {
    flexGrow: 1,
    position: 'relative',
    margin: '10px',
    borderRadius: '2px',
  };

  const spaceClass = mergeStyles(rootStyle);

  const [, drop] = useDrop(
    () => ({
      accept: 'note',
      drop(item: any, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset()!;
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        setNotePosition(item.id, left > 0 ? left : 0, top > 0 ? top : 0);
        return undefined;
      },
    }),
    [sharedMap],
  );

  return (
    <div id="NoteSpace" ref={drop} className={spaceClass}>
      <ThemeProvider theme={lightTheme}>
        {noteIds.map((id) => {
          return <Note id={id} key={id} />;
        })}
      </ThemeProvider>
    </div>
  );
}
