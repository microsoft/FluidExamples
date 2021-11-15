import { AzureMember } from '@fluidframework/azure-client';
import { useFluidContext } from './use-fluid-context';

export function useMyself() {
  const { services } = useFluidContext();
  return services.audience.getMyself() as AzureMember;
}
