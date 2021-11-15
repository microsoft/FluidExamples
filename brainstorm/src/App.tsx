import { AzureContainerServices } from '@fluidframework/azure-client';
import { IFluidContainer } from '@fluidframework/fluid-static';
import { SharedMap } from 'fluid-framework';
import { connectionConfig, containerSchema } from './Config';
import { FluidContext } from './contexts/fluid-context';
import { useFluidConnection } from './core/use-fluid-connection';
import { BrainstormView } from './view/BrainstormView';

interface ConnectedAppProps {
  container: IFluidContainer;
  services: AzureContainerServices;
}
function ConnectedApp(props: ConnectedAppProps) {
  const context = {
    container: props.container,
    services: props.services,
    sharedMap: props.container.initialObjects.map as SharedMap,
  };

  return (
    <FluidContext.Provider value={context}>
      <BrainstormView />
    </FluidContext.Provider>
  );
}

export function App() {
  const { container, services, isLoading, error } = useFluidConnection(
    connectionConfig,
    containerSchema,
  );

  if (isLoading) {
    return <div>Connecting, please wait</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ConnectedApp container={container!} services={services!}></ConnectedApp>
  );
}
