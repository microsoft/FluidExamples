
export type TripStopDetails = {
  name: string;
  photo: string;
  id: string;
  date: string;
};

let allTrips = [
    {
      name: "West Coast Trip",
      id: "trip-100",
      photo: "west-coast-trip.jpg",
      dates: "03/03/2023 - 03/20/2023",
      cities: [
        {
            name: "Seattle",
            photo: "/seattle.jpg",
            id: "tripstop-1",
            date: "03/03/2023",
          },
          {
              name: "Portland",
              photo: "/portland.jpg",
              id: "tripstop-2",
              date: "03/05/2023",
          },
          {
              name: "San Francisco",
              photo: "/san-francisco.jpg",
              id: "tripstop-3",
              date: "03/07/2023",
          }
      ]
    },
  ];
  
  export function getAllTrips() {
    return allTrips;
  }