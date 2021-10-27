# @fluid-example/shared-string

## About this repo

This repo is an example to demonstrate integrating the Fluid `SharedString` DDS into a [`create-react-app`](https://create-react-app.dev/). To use this example, we make the following assumptions:

1. You want to use React.js for your view
1. You already have Node installed on your local machine. If not, follow the instructions [here](https://nodejs.org/en/download/).

For a more detailed explanation of the `SharedString` DDS please click [here](https://fluidframework.com/docs/data-structures/string/).

--- 

## Using this repo

### Run the app locally

To run our local server, Tinylicious, on the default values of `localhost:7070`, enter the following into a terminal window:

```
npx tinylicious
```

Now, with our local service running in the background, we need to connect the application to it. The app has already been configured to this so now we just need to run the following in a new terminal window to start the app.

```bash
npm i
npm run start
```