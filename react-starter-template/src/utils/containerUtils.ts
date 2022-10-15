import { TinyliciousClient } from '@fluidframework/tinylicious-client';
import { containerSchema, clientProps, setDefaultData, FILEPATH } from '../config';

const client = new TinyliciousClient(clientProps);

export const createFilePath = (id: string) => {
  return `/${FILEPATH}/${id}`;
};

export const createFluidFile = async () => {
  const { container } = await client.createContainer(containerSchema);
  setDefaultData(container);
  const id = await container.attach();
  return createFilePath(id);
};

export const getFluidContainer = async (id: string) => {
  return await client.getContainer(id, containerSchema);
};
