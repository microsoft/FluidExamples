# Server-side Node App with Fluid

This repository contains a simple NodeJS application that enables all connected clients to generate random numbers and view the result. The key take-away is to have the correct container id for the server to run properly.

## Getting started

Run Tinylicious server in the backgroud as,

```sh
npm run start:server
```

Open a new terminal and run the Tinylicious client:

```sh
npm run start:client
```

The client will ask to `Enter the container id`. If you are running the client for the first time, you can enter the container id as `undefined`. This will create a new container and return the id in the console. 

Later on, you can launch another client and enter the same container id to see the magic of Fluid. 
