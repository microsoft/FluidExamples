# @fluid-example/cra-demo
This is an experimental learning tutorial demonstrating the integration of Fluid into [`create-react-app`](https://create-react-app.dev/).

Concepts you will learn:
1. How to integrate Fluid into a React application
2. How to run and connect your application to a local Fluid service (Tinylicious)
3. How to create and get Fluid Containers and collaborative objects
4. How to use a [SharedMap distributed data structure (DDS)](https://fluidframework.com/docs/apis/map/sharedmap/) to sync data between connected clients


\* Just want to see the code? Jump to the [finished tutorial.](./src/App.js).

## Demo introduction

In this demo we will be doing the following:

1. [Install Create-React-App](#cra)
2. [Install Fluid package dependencies](#install)
3. [Import and initialize Fluid dependencies](#import)
4. [Get the Fluid SharedMap](#init)
5. [Update the view](#view)
6. [Next Steps](#next)

## 1. <a style="position: relative; top: 20px" name="cra"></a> Use Create-React-App

### Using NPM
```bash
npx create-react-app my-app-name --use-npm
cd my-app-name
```

### Using Yarn
```bash
npx create-react-app my-app-name
cd my-app-name
```

### 1.a Start the app

The `tinylicious` server will be needed to run this demo locally.

```bash
npx tinylicious
```

Open up a new terminal tab and start up our React app

```bash
npm run start
```

## 2. <a style="position: relative; top: 20px" name="install"></a> Install Fluid package dependencies

There are two packages to install to get started with Fluid:

`fluid-framework` -- The primary Fluid package that contains the SharedMap we'll use to sync data.

`@fluidframework/tinylicious-client` -- Defines the client we'll use to get our Fluid [container](https://fluidframework.com/docs/glossary/#container) for local development.

### Using NPM
```bash
npm install fluid-framework @fluidframework/tinylicious-client
```

### Using Yarn
```bash
yarn add fluid-framework @fluidframework/tinylicious-client
```

Lastly, open up the `App.js` file, as that will be the only file we need to edit.

## 3. <a style="position: relative; top: 20px" name="import"></a> Import and initialize Fluid dependencies

`TinyliciousClient` is a client for `Tinylicious`, a local Fluid server used for testing our application. The client will include a method for creating a [Fluid container](https://fluidframework.com/docs/glossary/#container) with a set of initial [DDSes](https://fluidframework.com/docs/concepts/dds/) or [DataObjects](https://fluidframework.com/docs/glossary/#dataobject) that are defined in the `containerSchema`.

> The Fluid container interacts with the processes and distributes operations, manages the lifecycle of Fluid objects, and provides a request API for accessing Fluid objects.

`SharedMap` is the DDS that we will initialize on our container.

```js
// App.js
// Add to the top of the file

import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "@fluid-experimental/fluid-framework";
```

### 3.a Configure the service client

This demo illustrates using the Tinylicious for local development, so the client is a new instance of the `TinyliciousClient`.

```js
// add below imports
const client = new TinyliciousClient();
```

Before the client can create any containers, we need a `containerSchema` that will define, by name, the data objects needed in this application.

```js
const containerSchema = {
    initialObjects: { myMap: SharedMap }
}; 
```

Since we'll be dealing with map data, it's common to store important map keys as constants, rather than typing the raw string each time.

```js
const timeKey = "time-key";
```

## 4. <a style="position: relative; top: 20px" name="init"></a> Get the Fluid SharedMap

Fluid applications can be loaded in one of two states, creating or loading . This demo differentiates these states by the presence, or absence of a hash string(`localhost:3000/#abc`), which will also serves as the container `id`. The function below will return the `myMap` SharedMap, defined above, from either a new container, or an existing container, based on the presence of a hash long enough to include an `id` value. 


```js
const getMyMap = async () => {
    let container;
    if (location.hash <= 1) {
        ({ container } = await client.createContainer(containerSchema));
        container.initialObjects.myMap.set(timeKey, Date.now().toString());
        const id = await container.attach();
        location.hash = id;
    } else {
        const id = location.hash.substring(1);
        ({ container } = await client.getContainer(id, containerSchema));
    }
    return container.initialObjects.myMap;
}
```


### 4.a Get the SharedMap on load

Now that we've defined how to get our Fluid map, we need to tell React to call `getMyMap` on load, and then store the result in state.
React's [`useState`](https://reactjs.org/docs/hooks-state.html) will provide the storage we need, and [`useEffect`](https://reactjs.org/docs/hooks-effect.html) will allow us to call `getMyMap` on render, passing the returned value into `setFluidMap`. 

By setting an empty dependency array at the end of the `useEffect`, we ensure that this function only gets called once.

```jsx
// Add to the top of our App
const [fluidMap, setFluidMap] = React.useState(undefined);

React.useEffect(() => {
    getMyMap().then(myMap => setFluidMap(myMap));
}, []);
```

### 4.b Sync Fluid and View data

Syncing our Fluid and View data requires that we set up an event listener, which is another usecase for `useEffect`. This second `useEffect` function will return early if `fluidMap` is not defined and be ran again once `fluidMap` has been set thanks to the added dependency.

To sync the data we're going to create a `syncView` function, call that function once to initialize the view, and then continue calling that function each time the map's "valueChanged" event is raised.



```jsx
// Add below the previous useEffect
const [viewData, setViewData] = React.useState(undefined);

React.useEffect(() => {
    if (fluidMap !== undefined) {
        // sync Fluid data into view state
        const syncView = () => setViewData({ time: fluidMap.get(timeKey) });
        // ensure sync runs at least once
        syncView();
        // update state each time our map changes
        fluidMap.on("valueChanged", syncView);
        // turn off listener when component is unmounted
        return () => { fluidMap.off("valueChanged", syncView) }
    }
}, [fluidMap])
```


## 5. <a style="position: relative; top: 20px" name="view"></a> Update the view

In this simple multi-user app, we are going to build a button that, when pressed, shows the current timestamp. We will store that timestamp in Fluid so that each co-authors will automatically see the most recent timestamp at which any author pressed the button.

To make sure we don't render the app too soon, we return a blank `<div />` until the `viewData` is defined. Once that's done, we'll render a button that sets the `timeKey` key in `myMap` to the current timestamp. Each time this button is pressed, every user will see the latest value stored in the `time` state variable.

```jsx
    // update the App return

    if (!viewData) return <div/>;

    return (
        <div className="App">
            <button onClick={() => fluidData.mySharedMap.set(timeKey, Date.now().toString())}>
                click
            </button>
            <span>{viewData.time}</span>
        </div>
    )
```

When the app loads it will update the URL. Copy that new URL into a second browser and note that if you click the button in one browser, the other browser updates as well.

![cra](https://user-images.githubusercontent.com/1434956/111496992-faf2dc00-86fd-11eb-815d-5cc539d8f3c8.gif)

## 6. <a style="position: relative; top: 20px" name="next"></a>  Next Steps

- Try extending the demo with more key/value pairs and a more complex UI
  - `npm install @fluentui/react` is a great way to add [UI controls](https://developer.microsoft.com/en-us/fluentui#/)
- Try using other DDSes such as the [SharedString](https://fluidframework.com/docs/apis/sequence/sharedstring/)
