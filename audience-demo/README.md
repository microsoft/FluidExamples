# @fluid-example/audience-demo

This repository contains a simple React application which demonstrates Fluid Audiences. The React client will display all users connected to a Fluid Container.

--- 

## Using this repo

### Start the app locally

To run an Azure Client service locally, on the default values of `localhost:7070`, enter the following into a terminal window:

```
npm run start:server
```

With the local service running in the background, we need to connect the application to it. Run the following commands in a new terminal window to start the app. Navigate to `localhost:3000` in the browser to view the app.

```bash
npm i
npm run start
```

### Observe app functionality

The browser should display boxes which represents current members in the audience. The box with the blue border represents the current user who is viewing the browser client while the boxes with the black border represents the other members who are connected to the container. Create a new browser tab and navigate to the running app to simulate a new user entering the collaborative session. As you open and close new tabs, the corresponding member boxes should render on the app.

