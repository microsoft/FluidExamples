import './App.css';
import React from 'react';
import { FluidContainer, SharedMap } from "fluid-framework";
import { Button, Card, Col, Row, Typography } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { TripStopDetails } from './data/trips';
const { Meta } = Card;
const { Text } = Typography;

interface TripViewData {
  upvotes: number,
}

interface TripStopProps {
  city: TripStopDetails,
  fluidContainer: FluidContainer
}

const getTripStopData = async (container: FluidContainer, id: string) => {
  const map = container.initialObjects.sharedMap as SharedMap;
  const handle = map.get(id);
  if (handle) {
    return await handle.get()
  } else {
    const stopMap = await container.create(SharedMap);
    map.set(id, stopMap.handle);
    return stopMap;
  }
}

function TripStop(props: TripStopProps) {
  const { city, fluidContainer } = props;
  const [viewData, setViewData] = React.useState<TripViewData | undefined>(undefined);
  const [tripData, setTripData] = React.useState<SharedMap | undefined>(undefined);
  React.useEffect(() => {
    getTripStopData(fluidContainer, city.id).then(n => setTripData(n));
  }, [fluidContainer, city]);

  React.useEffect(() => {
    if (tripData !== undefined) {
      const syncView = () => setViewData({ upvotes: tripData.get("upvotes-key") || 0 });
      syncView();
      tripData.on("valueChanged", syncView);
      return () => { tripData.off("valueChanged", syncView) }
    }
  }, [tripData])

  const changeUpvotes = (a: number) => {
    const old = tripData?.get("upvotes-key") || 0
    tripData?.set("upvotes-key", Math.max(old + a, 0));
  }

  return (
    <Row>
      <Col flex="220px">
        <Card
          size="small"
          style={{
            width: 200,
          }}
          cover={
            <img
              alt="example"
              src={city.photo}
            />
          }
        >
          <Meta
            title={city.name}
            description={city.date}
          />
        </Card>
        <Button onClick={() => changeUpvotes(1)} type="primary" style={{ margin: '5px' }} shape="circle" icon={<CaretUpOutlined />} />
        <Button onClick={() => changeUpvotes(-1)} type="primary" style={{ margin: '5px' }} shape="circle" icon={<CaretDownOutlined />} />
        <Text style={{ marginLeft: '10px' }}>Upvotes: {viewData?.upvotes || 0}</Text>
      </Col>
    </Row>
  );
}

export default TripStop;