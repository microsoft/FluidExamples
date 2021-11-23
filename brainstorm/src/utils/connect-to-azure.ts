import {
  AzureClient,
  AzureClientProps,
  AzureContainerServices,
} from '@fluidframework/azure-client';
import { ContainerSchema, IFluidContainer } from 'fluid-framework';

export interface ConnectToAzureResult {
  container?: IFluidContainer;
  services?: AzureContainerServices;
  containerId?: string;
}

export async function connectToAzure(
  config: AzureClientProps,
  schema: ContainerSchema,
) {
  let isNew = location.hash.length === 0;
  const client = new AzureClient(config);
  let result: ConnectToAzureResult;

  if (isNew) {
    const { container, services } = await client.createContainer(schema);
    const containerId = await container.attach();
    result = { containerId, container, services };
  } else {
    let containerId = location.hash.substring(1);
    const { container, services } = await client.getContainer(
      containerId,
      schema,
    );
    result = { containerId, container, services };
  }

  await new Promise<void>((resolve) => {
    result.container!.once('connected', () => {
      resolve();
    });
  });

  return result;
}
