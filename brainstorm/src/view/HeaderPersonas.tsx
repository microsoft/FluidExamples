import { Facepile } from '@fluentui/react';
import { useMemo } from 'react';
import { useAllMembers } from '../core/use-all-members';

export function HeaderPersonas() {
  const allMembers = useAllMembers();
  const personas = useMemo(
    () =>
      [...allMembers.values()].map((member) => {
        return { personaName: member.userName };
      }),
    [allMembers],
  );

  return (
    <Facepile styles={{ root: { alignSelf: 'center' } }} personas={personas} />
  );
}
