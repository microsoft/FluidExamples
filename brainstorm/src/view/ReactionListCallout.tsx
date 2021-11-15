import { Icon, Label, Stack } from '@fluentui/react';
import { values } from 'lodash';
import React from 'react';
import { useNoteVotesList } from '../brainstorm-hooks';
import { PersonaList } from '../components/PersonaList';

export type ReactionListCalloutProps = {
  noteId: string;
};

export function ReactionListCallout(props: ReactionListCalloutProps) {
  const allLikes = useNoteVotesList(props.noteId);

  const likes = values(allLikes);
  if (likes.length === 0) {
    return null;
  }

  return (
    <div>
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <Icon
          iconName={'Like'}
          style={{ fontSize: 15, alignSelf: 'center' }}
        ></Icon>
        <Label>Like Reactions</Label>
      </Stack>
      <PersonaList users={likes} />
    </div>
  );
}
