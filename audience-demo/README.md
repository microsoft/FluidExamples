# @fluid-example/audience-demo

This repository contains a simple React application which demonstrates Fluid Audiences. The React client will display all users connected to a Fluid Container.

### Demo workflow

The browser will initially display three user id buttons as well as an optional container id input field. Leave the container id field blank to create a new container or input an existing container id to join an existing container. For your first client, leave the container id blank and choose a user id as there are no collaborative sessions to join yet.

The browser will display boxes which represents current members in the audience. The box with the blue border represents the current user who is viewing the browser client while the boxes with the black border represents the other members who are connected to the container. Create a new browser tab and navigate to `localhost:3000` to simulate a new user entering the collaborative session. To connect to the first session, enter the container id from the first browser's url. As you open and close new tabs, the corresponding member boxes will appear.

Note that new boxes will only generate for each unique user. Joining a container on a new browser while selecting an existing user id will increase the number of connections for that user.

---

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
