import { FrsClient } from '@fluid-experimental/frs-client';
import { v4 as uuid } from 'uuid';
import {
  containerConfig,
  setDefaultData,
  serviceConfig,
  FILEPATH,
  connectionConfig,
} from '../config';

const client = new FrsClient(connectionConfig);

export const createFilePath = (id: string) => {
  return `/${FILEPATH}/${id}`;
};

export const createFluidFile = async () => {
  const id = uuid();
  const { fluidContainer } = await client.createContainer(
    { ...serviceConfig, id },
    containerConfig
  );
  setDefaultData(fluidContainer);
  return createFilePath(id);
};

export const getFluidContainer = async (id: string) => {
  return await client.getContainer({ ...serviceConfig, id }, containerConfig);
};
