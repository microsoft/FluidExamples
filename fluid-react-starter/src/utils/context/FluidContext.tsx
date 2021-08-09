import React, { useState, useEffect } from 'react';
import { ModelContext } from './context';
import { FluidModel } from '../../model';
import { getFluidContainer } from '../containerUtils';

export const FluidContext: React.FC<{ id: string }> = ({ id, children }) => {
  const [model, setModel] = useState<FluidModel | undefined>();

  useEffect(() => {
    const loadModel = async () => {
      const { fluidContainer, containerServices } = await getFluidContainer(id);
      setModel(new FluidModel(fluidContainer, containerServices));
    };
    loadModel();
  }, [id]);

  if (!model) return <div />;

  // Force typing on data because we know the shape
  return <ModelContext.Provider value={model}>{children}</ModelContext.Provider>;
};
