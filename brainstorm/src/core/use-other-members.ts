import { useMemo } from 'react';
import { useAllMembers } from './use-all-members';
import { useMyself } from './use-myself';

export function useOtherMembers() {
  const myself = useMyself();
  const allMembers = useAllMembers();

  const otherMembers = useMemo(() => {
    const others = new Map(allMembers);
    if (myself) {
      others.delete(myself!.userId);
    }

    return others;
  }, [myself, allMembers]);

  return otherMembers;
}
