import { Text } from '@fluentui/react';
import React from 'react';
import { useNoteLastModified } from '../brainstorm-hooks';

interface NoteFooterProps {
  noteId: string;
}

export function NoteFooter(props: NoteFooterProps) {
  const { noteId } = props;

  const [lastEdited] = useNoteLastModified(noteId);

  let lastEditedMemberName = lastEdited?.userName || 'unknown';

  return (
    <div style={{ flex: 1 }}>
      <Text
        block={true}
        nowrap={true}
        variant={'medium'}
        styles={{
          root: { alignSelf: 'center', marginLeft: 7 },
        }}
      >
        Last edited by {lastEditedMemberName}
      </Text>
    </div>
  );
}
