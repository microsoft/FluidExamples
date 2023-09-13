# @fluidframework/vue-demo

## About this repo

This repo is a Fluid starter template that was created to answer the question "how do I create a Fluid app that is more complex than Hello World?" To answer this question this repo makes the following assumptions:

1. You want to use [Vue.js](https://vuejs.org/) for your view
2. You want to keep clear separation between your model and view
3. You want a light state management framework to remove the boilerplate needed to store, access and modify Angular app state
4. You already have Node installed on your local machine. If not, follow the instructions [here](https://nodejs.org/en/download/).

## Overview

In this readme we'll walk you through the following topics:

### Using this repo locally

-   Run the app locally

### Modifying the model

-   Modify the schema to include additional DDSes

---

## Using this repo

### Run the app locally

To run our local server, Tinylicious, on the default values of `localhost:7070`, enter the following into a terminal window:

```bash
npx tinylicious
```

Now, with our local service running in the background, we need to connect the application to it.
The app has already been configured to this so now we just need to run the following in a new terminal window to start the app:

```bash
npm install
npm run dev
```

Navigate to `localhost:5173` in the browser to view the app.

## Modifying the model

### Specify additional DDSes

Inside of `src/App.vue`, you can define the `initialObjects` that are returned by the container in the `containerSchema`.

To add another DDS to this list, make sure that the DDS is imported from `fluid-framework`, select a key, and add the DDS to `initialObjects`.

```ts
import { SharedMap, SharedCounter } from "fluid-framework";

const containerSchema = {
	initialObjects: {
		myMap: SharedMap,
		myCounter: SharedCounter,
	},
};
```