# @fluid-example/audience-demo

This repository contains a simple [React](https://react.dev) application which demonstrates Fluid Audiences.
The React client will display all users connected to a Fluid Container.

### Start the app locally

To run an Azure Client service locally, on the default values of `localhost:7070`, enter the following into a terminal window:

```bash
npx @fluidframework/azure-local-service
```

With the local service running in the background, we need to connect the application to it.
Run the following commands in a new terminal window to start the app:

```bash
npm install
npm start
```

Navigate to [localhost:3000](http://localhost:3000) in the browser to view the app.

### Demo workflow

The browser will initially display three user ID buttons as well as an optional container ID input field.
Leave the container ID field blank to create a new container (with a random UUID for its ID) or input an existing container ID to join an existing container.
For your first client, leave the container ID blank and choose a user ID as there are no collaborative sessions to join yet.

The browser will display boxes which represents current members in the audience.
The box with the blue border represents the current user who is viewing the browser client while the boxes with the black border represents the other members who are connected to the container.

To add another user to the session, copy the container ID from the URL of the first user (everything after the `#` in the URL).
Then create a new browser tab and navigate [localhost:3000](http://localhost:3000) again.
Enter the container ID from the first session, and select a user ID to join as.
As you open and close new tabs, the corresponding member boxes will appear.

Note that new boxes will only generate for each unique user.
Joining a container in a new browser while selecting an existing user ID will increase the number of connections for that user.
