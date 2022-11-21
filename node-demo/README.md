# @fluid-example/node-demo

This repository contains a simple NodeJS application connected with the Fluid Framework. Connected clients generate random numbers and display the result of any changes to the shared state.

## Getting started

## Using this repo

### Run the app locally

To run our local server, Tinylicious, on the default URL of `localhost:7070`, enter the following into a terminal window:

```
npm run start:server
```

With the local service running in the background, we need to connect the application to it. Run the following commands in a new terminal window to start the app. Navigate to `localhost:3000` in the browser to view the app.

```bash
npm i
npm run start:client
```

To create a new Fluid container press Enter. The container id will be printed in the terminal. Copy the container id, launch a new terminal window, and type/paste the initial container id to have multiple collaborative NodeJS clients.
