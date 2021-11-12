# @fluid-example/teams-fluid-hello-world
This is a tutorial for integrating Fluid-powered real-time collaboration features into a [Microsoft Teams tab application](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/what-are-tabs). In it, we will add a simple dice roller application that allows all members that have the tab open to roll a dice together and see the updates in real-time.

Concepts you will learn:
1. How to integrate a Fluid client into a Microsoft Teams tab application
2. How to run and connect your Teams application to a Fluid service (Azure Fluid Relay)
3. How to create and get Fluid Containers and collaborative objects
4. How to use a [SharedMap distributed data structure (DDS)](https://fluidframework.com/docs/data-structures/map/) to sync data between connected clients


\* Just want to see the code? Jump to the [finished tutorial.](./src/client/helloWorldTab).

## Demo introduction

In this recipe, you will do the following:

  - [Use Microsoft Teams App template](#use-microsoft-teams-app-template)
  - [Install Fluid package dependencies](#install-fluid-package-dependencies)
  - [Import and initialize Fluid dependencies](#import-and-initialize-fluid-dependencies)
  - [Create the Fluid container](#create-the-fluid-container)
  - [Get the Fluid SharedMap](#get-the-fluid-sharedmap)
  - [Update the view](#update-the-view)
  - [Next steps](#next-steps)
  - [Common issues](#common-issues)

## Use Microsoft Teams App template

### Using NPM

Follow the instructions [here](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/create-channel-group-tab?tabs=nodejs#generate-your-project) to setup a default Teams Tab application.

To maintain consistency with this walk-thorugh, please answer the following questions that are prompted during setup with the following values:

```ts
Title of your Microsoft Teams app project? : "TeamsFluidHelloWorld"

Default Tab Name (max 16 characters)? : "HelloWorldTab"
```

### Start the app

To run and start the Teams application, open another terminal and follow the instructions [here](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/create-channel-group-tab?tabs=nodejs#upload-your-application-to-teams).

Now follow the [instructions](https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/create-channel-group-tab?tabs=nodejs#upload-your-application-to-teams) to upload the application to a Teams Tab. At this point, you have a vanilla Teams tab running within your main Teams App. Now, let's add the Fluid functionality to it!

## Install Fluid package dependencies

There are three packages to install to get started with Fluid:

`fluid-framework` -- The primary Fluid package that contains the SharedMap we'll use to sync data. This can also be used by your tab for other [DDSes](https://fluidframework.com/docs/data-structures/overview/) as required by your application. However, these are out-of-scope for the purposes of this introductory recipe.

`@fluidframework/azure-client` -- Defines the client we'll use to get our Fluid [container](https://fluidframework.com/docs/glossary/#container) for local and remote development.

`@fluidframework/test-client-utils` -- Defines the `InsecureTokenProvider` we'll use to get our security token.

### Using NPM
```bash
npm install fluid-framework @fluidframework/azure-client @fluidframework/test-client-utils
```

Lastly, open up the `src/client/helloWorldTab` folder, as that will be the only folder we are editing.

## Import and initialize Fluid dependencies

`AzureClient` is a client for `Azure Fluid Relay`; it allows for both connecting to a [remote Azure instance](https://docs.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/provision-fluid-azure-portal) for production scenarios, and a local Fluid server for testing and developing our application. We will define the configuration for connecting to these services in `AzureClientProps`. The client provides a method for creating a [Fluid container]({{< relref "containers.md" >}}) with a set of initial [DDSes]({{< relref "dds.md" >}}) or [SharedObjects]({{< relref "glossary.md#shared-objects" >}}) that are defined in the `containerSchema`. 

> The Fluid container interacts with the processes and distributes operations, manages the lifecycle of Fluid objects, and provides a request API for accessing Fluid objects.

`SharedMap` is the DDS that will be initialized on our container.

### Create a `Util.ts`

Create a new file and name it [Util.ts](./src/client/helloWorldTab/Util.ts) in `src/client/helloWorldTab`. This file will contain all the importation, initialization, and functions of Fluid dependencies.

```ts
// Util.ts
// Add to the top of the file

import { SharedMap, IFluidContainer } from "fluid-framework";
import { AzureClient, AzureClientProps, LOCAL_MODE_TENANT_ID } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
```

```ts
// Util.ts
// Add below the imports of the file

export async function createContainer() : Promise<string> {
    const { container } = await client.createContainer(containerSchema);
    const diceMap = container.initialObjects.diceMap as SharedMap;
    diceMap.set(diceValueKey, 1);
    const containerId = await container.attach();
    return containerId;
};

export async function getContainer(id : string) : Promise<IFluidContainer> {
    const { container } = await client.getContainer(id, containerSchema);
    return container;
};
```

Here we are only exporting `createContainer` and `getContainer` because that is all we'll need to create and fetch our Fluid container.

### Configure the service client

The client is a new instance of the `AzureClient`, where it supports both remote (Azure Fluid Relay) and local mode (Azure Local Service).

```ts
// Util.ts
// add below imports

const client = new AzureClient(connectionConfig);
```

Before the client can be used, it needs an `AzureClientProps` that will define the type of connection the client will be using. We will connect locally for now.

```ts
// Util.ts
// add above the previous line

const connectionConfig : AzureClientProps =
{
    connection: {
        tenantId: LOCAL_MODE_TENANT_ID,
        tokenProvider: new InsecureTokenProvider("foobar", { id: "user" }),
        orderer: "http://localhost:7070",
        storage: "http://localhost:7070"
    }
};
```

And before the client can create any containers, it needs a `containerSchema` that will define, by name, the data objects used in this application. You can think of the `connectionConfig` as the properties required to connect to the service, whereas the `containerSchema` is defining the data structures for how we want our information to be stored.

```ts
// Util.ts
// add above the previous line

const containerSchema = {
    initialObjects: { diceMap: SharedMap }
};
```


It's a common pattern to store important map keys as constants, rather than typing the raw string each time.

```ts
// Util.ts
// add below imports

export const diceValueKey = "dice-value-key";
```

We are also going to store the query parameter key as a constant for easy retrieval and parsing.

```ts
// Util.ts
// add below imports

export const containerIdQueryParamKey = "containerId";
```

### Create the Fluid container

The creation flow of Teams tab application requires a [configuration page](./src/client/helloWorldTab/HelloWorldTabConfig.tsx). We'll be creating a container in the config page and appending the container ID as an URL query param for easy retrieval in the content page.


```ts
// HelloWorldTabConfig.tsx
// Add to the top of the file

import { createContainer, containerIdQueryParamKey } from "./Util";
```

Replace the `onSaveHandler` with the following code.
```ts
const onSaveHandler = async (saveEvent: microsoftTeams.settings.SaveEvent) => {
    const host = "https://" + window.location.host;
    const containerId = await createContainer();
    microsoftTeams.settings.setSettings({
        contentUrl: host + "/helloWorldTab/?" + containerIdQueryParamKey + "=" + containerId + "&name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
        websiteUrl: host + "/helloWorldTab/?" + containerIdQueryParamKey + "=" + containerId + "&name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
        suggestedDisplayName: entityId.current,
        removeUrl: host + "/helloWorldTab/remove.html?theme={theme}",
        entityId: entityId.current
    });
    saveEvent.notifySuccess();
};
```

Here we are creating a container and then appending the container ID to the `contentUrl` and `websiteUrl` so when the content page loads, we can easily find the container from the query parameter and retrieve the container we just created.

You will notice that we are setting the `suggestedDisplayName` to `entityId.current`. This will allow the user to name the Tab in the cofig page.

## Get the Fluid `SharedMap`

### Get the Fluid container

Fluid applications can be loaded in one of two states, creating or loading. Since we've already created the container in the configuration page, we now want to load it in the content page, [HelloWorldTab](./src/client/helloWorldTab/HelloWordlTab.tsx). We will be rewriting everything inside the `HelloWorldTab` page, so let's remove the all the code there to start.

Add the following import statements.

```ts
import * as React from "react";
import { SharedMap } from "fluid-framework";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { FluidContent } from "./FluidContent";
import { getContainer, containerIdQueryParamKey } from "./Util";

export const HelloWorldTab = () => {
    // Add the following code here
};
```

To load the container ID, we first need to retrieve the `contentUrl` from the Teams settings. So let's initialize Microsoft Teams first.

```ts
// HelloWorldTab.tsx
// Add inside HelloWorldTab constant

microsoftTeams.initialize();
```

Now, because Teams application is just an IFrame injection of a webpage, it supports opening up the content page in a browser, which will be outside of Teams. So we need to know if the page is in Teams with the provided `inTeams` boolean.

```ts
// HelloWorldTab.tsx
// Add below the previous line

const [{ inTeams }] = useTeams();
```

With the basic building blocks in place, we can now get the container and `SharedMap`. To get the `SharedMap` and dynamically update it, let's define the `SharedMap` as a React state.

```ts
// HelloWorldTab.tsx
// Add below the previous useEffect

const [fluidMap, setFluidMap] = useState<SharedMap | undefined>(undefined);
```

The function below will parse the URL to get the query parameter string, defined by `containerIdQueryParamKey` in [Util.ts](./src/client/helloWorldTab/Util.ts), and retreives the container ID. With the container ID, we can now load the container to get the `SharedMap`. Once we have the `SharedMap`, set the `fluidMap` SharedMap, defined above.

```ts
// HelloWorldTab.tsx
// Add below the previous line

const getFluidMap = async (url : URLSearchParams) => {
    const containerId = url.get(containerIdQueryParamKey);
    if (!containerId) {
        throw Error("containerId not found in the URL");
    }
    const container = await getContainer(containerId);
    const diceMap = container.initialObjects.diceMap as SharedMap;
    setFluidMap(diceMap);
};
```

### Get the SharedMap on load

Now that the app has defined how to get our Fluid map, you need to tell React to call `getFluidMap` on load, and then store the result in state based on if we are inside Teams.
React's [useState hook](https://reactjs.org/docs/hooks-state.html) will provide the storage needed, and [useEffect](https://reactjs.org/docs/hooks-effect.html) will allow us to call `getFluidMap` on render, passing the returned value into `setFluidMap`. 

By setting an empty dependency array at the end of the `useEffect`, the app ensures that this function only gets called once.

```ts
// HelloWorldTab.tsx
// Add below the getFluidMap definition

useEffect(() => {
    if (inTeams === true) {
        microsoftTeams.settings.getSettings(async (instanceSettings) => {
            const url = new URL(instanceSettings.contentUrl);
            getFluidMap(url.searchParams);
        });
        microsoftTeams.appInitialization.notifySuccess();
    }
}, [inTeams]);

if (inTeams === false) {
    return (
        <div>This application only works in the context of Microsoft Teams</div>
    );
}
```
If `inTeams` is true, then we will retrieve the URL from the `contentUrl` we defined in [HelloWorldTabConfig](./src/client/helloWorldTab/HelloWorldTabConfig.tsx) as a mandatory step and notify Teams that your app has successfully loaded with `microsoftTeams.appInitialization.notifySuccess()`. If `inTeams` is false, we will return a `div` that says the application only works within Teams.

<br />

| :warning: WARNING                                                                                                                                       |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| If `notifySuccess` is not called within 30 seconds, it is assumed that the app timed out and an error screen with a retry option will appear.

<br />

### Sync Fluid and view data

With `fluidMap` defined, we can now have Fluid and the React view interact. However, it's better practice and cleaner code to separate the Fluid logic from the Teams content page initialization [content page definition](./src/client/helloWorldTab/HelloWordlTab.tsx), and pass the `fluidMap` to a React component that handles all of the interactions with the `SharedMap` itself.

Before we pass the `fluidMap` to a React component, we need to ensure that it is defined. Until the `fluidMap` becomes defined, we will just return a loading text.

```tsx
// HelloWorldTab.tsx
// Add below the previous useEffect

if (fluidMap !== undefined) {
    return (
        <FluidContent fluidMap={fluidMap} />
    );
}

return (
    <div>Loading FluidContent...</div>
);
```

Now let's create out React component. Create a [FluidContent.tsx](./src/client/helloWorldTab/FluidContent.tsx) file under `src/client/helloWorldTab` and import the following React libraries and `dice-value-key` from [Util.ts](./src/client/helloWorldTab/Util.ts).

```ts
// FluidContent.tsx
// Add to the top of the file

import * as React from "react";
import { Button } from "@fluentui/react-northstar";
import { SharedMap } from "fluid-framework";
import { diceValueKey } from "./Util";
import { useState, useEffect } from "react";
```

We can now define the props this React component will take. Since we are only passing in a `fluidMap`, there is only 1 attribute for the prop.

```ts
// FluidContent.tsx
// Add below the imports

export type FluidContentProps = Readonly<{
    fluidMap: SharedMap;
}>
```

Instead of passing the map into the React component directily as an argument, having it inside a prop allows modularity and future expansion if more parameters are needed.

Next, let's define the React component itself. As the file name suggest, the React component will be named `FluidContent`

```ts
// FluidContent.tsx
// Add below the props

export const FluidContent = (props : FluidContentProps) => {

};
```

The Fluid application we are using is a dice roller, so let's first define what the view state will look like. The view will need the dice value as a React state that get's updated whenever `fluidMap` is updated. Since `fluidMap` will provide the current dice value that got rolled, we can update the view's content and color based on the value it returns.

```ts
// FluidContent.tsx
// Add inside FluidContent constant

const generateState = (): {color : string, content : string} => {
    const diceValue = props.fluidMap.get(diceValueKey);
    // Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
    return {
        content: String.fromCodePoint(0x267f + diceValue),
        color: `hsl(${diceValue * 60}, 70%, 30%)`
    };
};
```

Syncing our Fluid and view data requires that the app create an event listener as `SharedMap` provides a `valueChanged` event that gets triggered everytime it gets modified by any connected client. This is another opportunity for `useEffect`. This `useEffect` function will run everytime `fluidMap` is updated thanks to the added dependency.

To sync the data we're going to create a `updateDice` function and then continue calling that function each time the map's "valueChanged" event is raised.

```ts
// FluidContent.tsx
// Add below generateState

const [diceView, setDiceView] = useState<{color : string, content : string} | undefined >(generateState());

useEffect(() => {
    // sync Fluid data into view state
    const updateDice = () => {
        setDiceView(generateState());
    };
    // Use the changed event to trigger the rerender whenever the value changes.
    props.fluidMap.on("valueChanged", updateDice);

    // turn off listener when component is unmounted
    return () => { props.fluidMap.off("valueChanged", updateDice); };
});
```

## Update the view

In this simple multi-user app, you are going to build a button that, when pressed, rolls the dice. We will store that newly rolled dice value in Fluid so that each co-author will automatically see the most recent dice roll at the moment that any other author pressed the button.

Each time this button is pressed, every user will see the latest dice value stored in the `diceView` state variable.

```tsx
// FluidContent.tsx
// Add below previous useEffect

// Set the value at our diceValueKey with a random number between 1 and 6.
const onClick = () => {
    props.fluidMap.set(diceValueKey, Math.floor(Math.random() * 6) + 1);
};

return (
    <div>
        <h2>Hello World!</h2>
        <div className="wrapper" style={{ alignItems: "center" }} >
            <div className="dice" style={{ color: diceView!.color, fontSize: "200px" }}>{diceView!.content}</div>
            <Button className="roll" style={{ fontSize: "50px" }} onClick={onClick}> Roll </Button>
        </div>
    </div>
);
```

![teams-fluid-config](https://fluidframework.blob.core.windows.net/static/images/teams-example-config.png)
![teams-fluid-content](https://fluidframework.blob.core.windows.net/static/images/teams-example-tab.png)


### Running the application

Now that Fluid functionalities are added, we need a running Fluid service for the app to work!. We can use the `tinylicious` server to run this demo locally. Open a separate command propmt and run the following command:

```bash
npx @fluidframework/azure-local-service@latest
```

Since this is all running against your `Azure Local Service`, its collaborative capabilities are limited to only running on your machine. Next, we will see how we can truly have anyone who views the tab be able to collaborate by linking our app to an Azure Fluid Relay instance. That way, when the app loads in Teams, multiple users should be able to join the same tab and see the same dice roller. Note that if you roll the dice, the other participants will see the dice get rolled.

## Next steps

### Using AzureClient with Azure Fluid Relay

Because this is a Teams tab application, collaboration and interaction is the main focus. Consider replacing the local mode `AzureClientProps` provided above with non-local credentials from your Azure service instance, so others can join in and interact with you in the application! Check out how to provision your Azure Fluid Relay service [here](https://docs.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/provision-fluid-azure-portal).

| :memo: NOTE                                                                                                                                             |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| It is important to hide the credentials we are passing into `AzureClientProps` from being accidentally checked in. The Teams project comes with a [.env](./.env) where you can store your credentials as environment variables and the file itself is already included in the `.gitignore`. Refer to the section below if you want to use the environment variables in Teams.

### Setting and getting environment variable

To set a environment variable and retrieve it in Teams, we can take advantage of the built in [.env](./.env) file. Set the environment variable in `.env` like below.

```bash
# .env

TENANT_KEY=foobar
```

To pass the contents of the `.env` file to our client-side app, we need to configure them into [webpack.config.js](./webpack.config.js) so that `webpack` provides access to them at runtime. Add the environment variable from `.env` as shown below.

```js
// webpack,config.js

webpack.EnvironmentPlugin({ 
    PUBLIC_HOSTNAME: undefined, 
    TAB_APP_ID: null, 
    TAB_APP_URI: null,
    REACT_APP_TENANT_KEY: JSON.stringify(process.env.TENANT_KEY) // Add environment variable here
}),
```

Now, let's access the environment variable in [Util.ts](./src/client/Util.ts)

```ts
// Util.ts

tokenProvider: new InsecureTokenProvider(JSON.parse(process.env.REACT_APP_TENANT_KEY!), { id: "user" }),
```

You may have noticed we are using `InsecureTokenProvider`. This is a convenient way of setting the application up quicky, but as the name suggests, it is not secure at all! Please visit [here](https://docs.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/connect-fluid-azure-service#token-providers) to learn more about how to use production ready token providers.

And now if you restart your Teams application, other users on their own computers who also open this tab from their Teams app will be able to roll the dice with you!


## Common issues

1. If you are experiencing a semi-transparent warning after you start the app with the message `WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB)`, this can be resolved by updating the following configuration in the `webpack.config.js`.

```js
{
  performance: {
    hints: false
  }
}
```
