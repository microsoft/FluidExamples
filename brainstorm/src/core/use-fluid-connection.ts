import { AzureClientProps } from '@fluidframework/azure-client';
import { ContainerSchema } from 'fluid-framework';
import { useEffect, useState } from 'react';
import {
  connectToAzure,
  ConnectToAzureResult,
} from '../utils/connect-to-azure';

export function useFluidConnection(
  config: AzureClientProps,
  schema: ContainerSchema,
) {
  const [result, setResult] = useState<ConnectToAzureResult>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setIsLoading(true);
    connectToAzure(config, schema)
      .then((result) => {
        setResult(result);
      })
      .catch((r) => {
        setErrorMessage(r);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [config, schema]);

  useEffect(() => {
    if (result?.containerId) {
      location.hash = result?.containerId;
    }
  }, [result?.containerId]);

  return {
    isLoading,
    error: errorMessage,
    ...result,
  };
}
