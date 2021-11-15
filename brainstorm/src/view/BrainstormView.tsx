import { mergeStyles } from '@fluentui/react';
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useMyself } from '../core/use-myself';
import { Header } from './Header';
import { MouseCursors } from './MemberMouseCursors';
import { NoteSpace } from './NoteSpace';

export const BrainstormView = () => {
  const myself = useMyself();

  if (!myself) {
    return <div>Logging you in. Please wait</div>;
  }

  const wrapperClass = mergeStyles({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  });

  return (
    <div className={wrapperClass}>
      <Header />
      <MouseCursors />
      <DndProvider backend={HTML5Backend}>
        <NoteSpace />
      </DndProvider>
    </div>
  );
};
