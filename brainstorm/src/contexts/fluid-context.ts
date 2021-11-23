import { AzureContainerServices } from '@fluidframework/azure-client';
import { IFluidContainer } from '@fluidframework/fluid-static';
import { ISharedMap } from 'fluid-framework';
import React from 'react';

export interface FluidContextType {
  container: IFluidContainer;
  services: AzureContainerServices;
  sharedMap: ISharedMap;
}
export const FluidContext = React.createContext<FluidContextType>({} as any);
