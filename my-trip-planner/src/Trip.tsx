import './App.css';
import { getAllTrips } from "./data/trips";
import TripStop from './TripStop';
import {
  AzureClient,
  AzureConnectionConfig,
  LOCAL_MODE_TENANT_ID,
} from "@fluidframework/azure-client";
import {
  generateTestUser,
  InsecureTokenProvider,
} from "@fluidframework/test-client-utils";
import { ContainerSchema, FluidContainer, IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import React from 'react';
import { useParams } from "react-router-dom";

import { Space, Typography } from 'antd';
const { Title } = Typography;

const user = generateTestUser();
const connectionConfig: AzureConnectionConfig = {
  tenantId: LOCAL_MODE_TENANT_ID,
  tokenProvider: new InsecureTokenProvider("fooBar", user),
  orderer: "http://localhost:7070",
  storage: "http://localhost:7070",
}

const useFluidContainer = (): FluidContainer => {
  const [fluidContainer, setFluidContainer] = React.useState<FluidContainer>();
  const getFluidData = async () => {
    // Configure the container.
    const clientProps = {
      connection: connectionConfig,
    };
    const client = new AzureClient(clientProps);
    const containerSchema: ContainerSchema = {
      initialObjects: { sharedMap: SharedMap },
      dynamicObjectTypes: [SharedString]
    }

    // Get the container from the Fluid service.
    let container: IFluidContainer;
    const containerId = window.location.hash.substring(1);
    if (!containerId) {
      container = (await client.createContainer(containerSchema)).container;
      const id = await container.attach();
      window.location.hash = id;
    }
    else {
      container = (await client.getContainer(containerId, containerSchema)).container;
      if (!container.connected) {
        await new Promise<void>((resolve) => {
          container.once("connected", () => {
            resolve();
          });
        });
      }
    }
    return container as FluidContainer;
    // // Return the Fluid SharedString object.
    // return container.initialObjects.sharedString as SharedString;
  }

  // Get the Fluid Data data on app startup and store in the state
  React.useEffect(() => {
    getFluidData()
      .then((data) => setFluidContainer(data));
  }, []);

  return fluidContainer as FluidContainer;
}

function Trip() {
  let { tripId } = useParams();
  let fluidContainer = useFluidContainer();

  let trip = getAllTrips().find(item => item.id === tripId);

  return (
    <div className="App">
      {fluidContainer ?
        <div>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Title level={2} style={{ float: "left", marginTop: 40 }}>{trip?.name}</Title>

            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              {trip?.cities.map((city) => (
                <TripStop fluidContainer={fluidContainer} city={city} key={city.id} />
              ))}
            </Space>
          </Space>

        </div> : <div> Loading </div>
      }
    </div>
  );
}

export default Trip;