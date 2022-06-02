import './App.css';
import React from 'react';
import { FluidContainer, SharedMap, SharedString } from "fluid-framework";
import { Card, Col, Row, Input } from 'antd';
import { TripStopDetails } from './data/trips';
const { Meta } = Card;
const { TextArea } = Input;

interface TripViewData {
  notes: string,
}

interface TripStopProps {
  city: TripStopDetails,
  fluidContainer: FluidContainer
}

const getNotesString = async (container: FluidContainer, id: string) => {
  const map = container.initialObjects.sharedMap as SharedMap;
  const handle = map.get(id);
  if (handle) {
    return await handle.get()
  } else {
    const sharedString = await container.create(SharedString);
    map.set(id, sharedString.handle);
    return sharedString;
  }
}

function TripStop(props: TripStopProps) {
  const { city, fluidContainer } = props;

  const [viewData, setViewData] = React.useState<TripViewData | undefined>(undefined);
  const [notes, setNotes] = React.useState<SharedString | undefined>(undefined);
  React.useEffect(() => {
    getNotesString(fluidContainer, city.id).then(n => setNotes(n));
  }, [fluidContainer, city]);


  React.useEffect(() => {
    if (notes !== undefined) {
      // sync Fluid data into view state
      const syncView = () => setViewData({ notes: notes.getText() });
      syncView();
      notes.on("valueChanged", syncView);
      return () => { notes.off("valueChanged", syncView) }
    }
  }, [notes])

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
      </Col>
      <Col flex="400px">
        <>
          <TextArea rows={4} placeholder="Itenirary notes" maxLength={6} value={viewData?.notes} />
        </>
      </Col>
    </Row>

  );
}

export default TripStop;