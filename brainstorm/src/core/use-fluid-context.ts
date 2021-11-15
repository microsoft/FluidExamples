import { useContext } from 'react';
import { FluidContext } from '../contexts/fluid-context';

export function useFluidContext() {
  const context = useContext(FluidContext);
  return context;
}
