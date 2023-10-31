# @fluid-example/node-demo

This repository contains a simple NodeJS application connected with the Fluid Framework.
Connected clients generate random numbers and display the result of any changes to the shared state.

## Getting started

Run `@fluidframework/azure-local-service` server in the background:

```bash
npx @fluidframework/azure-local-service
```

Open a new terminal and run the client:

```bash
npm install
npm start
```

To create a new Fluid container press Enter.
The container ID will be printed in the terminal.
To have multiple collaborative NodeJS clients, copy the container ID, launch a new terminal window, and type/paste the initial container ID.
