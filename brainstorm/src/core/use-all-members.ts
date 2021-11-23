import { useEffect, useState } from 'react';
import { useFluidContext } from './use-fluid-context';

export function useAllMembers() {
  const { services, container } = useFluidContext();
  const audience = services.audience;

  const [allMembers, setAllMembers] = useState(audience.getMembers());

  useEffect(() => {
    function onAudienceChanged() {
      const all = audience.getMembers();

      setAllMembers(all);
    }

    container.on('connected', onAudienceChanged);
    audience.on('membersChanged', onAudienceChanged);

    return () => {
      container.off('connected', () => onAudienceChanged);
      audience.off('membersChanged', () => onAudienceChanged);
    };
  }, [container, audience]);

  return allMembers;
}
