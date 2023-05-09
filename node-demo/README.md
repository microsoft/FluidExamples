# @fluid-example/node-demo

This repository contains a simple NodeJS application connected with the Fluid Framework.
Connected clients generate random numbers and display the result of any changes to the shared state.

## Getting started

Run Tinylicious server in the background:

```bash
npx tinylicious
```

Open a new terminal and run the client:

```bash
npm install
npm start
```

To create a new Fluid container press Enter. The container id will be printed in the terminal. Copy the container id, launch a new terminal window, and type/paste the initial container id to have multiple collaborative NodeJS clients.
