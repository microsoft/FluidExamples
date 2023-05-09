# @fluid-example/audience-demo

This repository contains a simple [React](https://react.dev) application which demonstrates Fluid Audiences.
The React client will display all users connected to a Fluid Container.

### Demo workflow

The browser will initially display three user ID buttons as well as an optional container ID input field.
Leave the container ID field blank to create a new container or input an existing container ID to join an existing container.
For your first client, leave the container ID blank and choose a user ID as there are no collaborative sessions to join yet.

The browser will display boxes which represents current members in the audience.
The box with the blue border represents the current user who is viewing the browser client while the boxes with the black border represents the other members who are connected to the container.
Create a new browser tab and navigate to the first browser's url to simulate a new user entering the collaborative session.
To connect to the first session, select a user ID.
As you open and close new tabs, the corresponding member boxes will appear.

Note that new boxes will only generate for each unique user.
Joining a container on a new browser while selecting an existing user ID will increase the number of connections for that user.

---

### Start the app locally

To run an Azure Client service locally, on the default values of `localhost:7070`, enter the following into a terminal window:

```bash
npx tinylicious
```

With the local service running in the background, we need to connect the application to it. Run the following commands in a new terminal window to start the app. Navigate to `localhost:3000` in the browser to view the app.

```bash
npm install
npm start
```
