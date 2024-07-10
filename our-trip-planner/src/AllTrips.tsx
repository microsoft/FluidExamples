import './App.css';
import { getAllTrips } from "./data/trips";
import { Link } from "react-router-dom";

import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
const { Meta } = Card;

function AllTrips() {
  let trips = getAllTrips();
  return (
    <div className="App">
      <div>
        <h1>All Trips</h1>
        <nav
          style={{
            borderBottom: "solid 1px",
            paddingBottom: "1rem",
          }}
        >

        {trips.map((trip) => (
          <Link
            style={{ display: "block", margin: "1rem 0" }}
            to={`/trip/${trip.id}`}
            key={trip.id}
          >

          <Card
              style={{
                width: 300,
              }}
              cover={
                <img
                  alt="example"
                  src={trip.photo}
                />
              }
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Meta
                title={trip.name}
                description={trip.dates}
              />
            </Card>

            
          </Link>
        ))} 
        </nav>
      </div>
    </div>
  );
}

export default AllTrips;
