# fluid-react-starter

## About this repo

This repo is a Fluid starter template that was created to answer the question "how do I create a Fluid app that is more complex than Hello World?" To answer this question this repo makes the following assumptions:

1. You want to use React for your view
2. You want to keep clear separation between your model and view
3. You want a light state management framework to remove the boilerplate needed to store, access and modify React app state


## Overview
In this readme we'll walk you through the following topics:

### Using this repo locally

- Run the app locally
### Modifying the model

- Modify the schema to include additional DDSes
- Update the `defaultData` of those DDSes
- Update the `model` to access and modify your Fluid data
- Write custom events

### Modifying the view

- Modify the store
  - `initialState`
  - `queries`
  - `actions`
  - `reducer`
- Importing and using the store
  - Using `queries`
  - Dispatching `actions`

### Publishing to Azure and FRS

- Run the app against an FRS instance
- Deploy the app


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

## Modifying the model

### Specify additional DDSes

Inside of `src/config.ts`, you can define the `initialObjects` that are returned by the container in the `containerSchema`. 

To add another DSS to this list, make sure that the DDS is imported from `@fluid-experimental/fluid-framework`, select a key, and add the DDS to `initialObjects`.

```ts
import { SharedMap, SharedCounter } from '@fluid-experimental/fluid-framework';

export const containerSchema = {
  name: 'cra-demo-container',
  initialObjects: {
    myMap: SharedMap,
    myCounter: SharedCounter
  },
};
```
### Update the `defaultData` of those DDSes

Inside of `src/config.ts` you can modify the `setDefaultData` function to change the data added to the initial DDSes upon container creation. Any `initialObjects` specified above will be available on `fluidContainer.initialObjects`. 

```ts
export const setDefaultData = (fluidContainer: FluidContainer) => {
  const { myMap, myCounter } = fluidContainer.intitialObjects;
  myCounter.increment(1); // start at 1
}
```

### Update the `model` to access and modify your Fluid data

All of our application's business logic will be stored in `model.ts`, which is a class with access to both the `FluidContainer` and the `FrsContainerServices`. 

In the `FluidModel` class we can expose new properties and methods that can leverage any of the default DDSes or `FrsContainerServices` properties, like `audience`. These properties and methods will be used to provide a `store` of data and actions for our view to access, so keep the model focused on lower level access of the data itself.

```ts
  // inside of the constructor
    this.counter = container.initialObjects.myCounter;
  //
  public getCounterValue = () => {
    return this.counter.value;
  }
  public jumpCounterFive = (): number => {
    return this.counter.increment(5)
  }
```

### Write custom events

This demo is written to funnel all model events through the `modelChanged` event. Each event emit accepts a payload that can used to differentiate one even from another. 

```ts
// inside of the constructor
    this.counter.on("incremented", (incrementAmount, newValue) => {
      const counterIncrementedPayload = { type: "counterIncremented", data: {incrementAmount, newValue} };
      this.emit("modelChanged", counterIncrementedPayload);
    });

```

## Modifying the view

A `store` can be used as a "view model", providing a place to store, access, modify and update stateful data. Due to the collaborative nature of Fluid applications, all operations follow the same circular path:

1. View performs actions to modify Fluid
2. Fluid emits an event when modified
3. Store updates local state based on that event
4. View updates to match local state

This means that local state is never modified directly by the UI, and both local and remote modifications to Fluid data result in the same update to local state. The `store` helps you to implement this pattern with the least amount of boilerplate possible.

### Create a store

// TODO: split this out into 4 parts and walk through creation

```ts
export const useGetCounterStore = () => useGetStore({
  initialState: model => model.getCounterValue(),
  queries: {
    getCounter: state => state,
    isMoreThan100: state => state > 100
  },
  actions: {
    increment: ( model, payload: {double: boolean} ) => {
      if (double) { 
        model.jumpCounterFive(); 
        model.jumpCounterFive(); 
      } else {
        model.jumpCounterFive();
      }
    }
  },
  reducer: (model, draft, { type, data }) => {
    switch (type) {
      case "counterIncremented":
        draft = data.newValue
        break;          
    }
  },
})
```
   

### Import and use the store

// TODO: walkthrough store usage

```tsx
const CounterPage = (props) => {
  const {
    dispatch,
    actions: { increment },
    queries: { getCounter, isMoreThan100 }
  } = useGetCounterStore();

  return(
    <div> 
    Counter is {isMoreThan100 ? "TOO BIG" : "kinda small" }  </br>
    <button onClick={() => dispatch(increment())} > jump </button> </br>
    <button onClick={() => dispatch(increment(double: true))} > BIG jump! </button> </br>
    </div>
  )
}


```






## Publishing to Azure and FRS


### Run the app against an Azure Fluid Relay service (FRS) instance

To run the app against a deployed FRS instance, the first set of `connectionConfig` values in `config.ts` need to be updated as the `useFrs` boolean will now be set to true. The tenant ID, orderer, and storage URLs should match those provided to you as part of the FRS onboarding process.

```typescript
export const connectionConfig: FrsConnectionConfig = useFrs
  ? {
      tenantId: 'YOUR-TENANT-ID-HERE',
      tokenProvider: new FrsAzFunctionTokenProvider('YOUR-AZURE-FUNCTION-URL-HERE', {
        userId: user.id,
        userName: (user as any).name,
      }),
      orderer: 'YOUR-ORDERER-URL-HERE',
      storage: 'YOUR-STORAGE-URL-HERE',
    }
  : {
      tenantId: 'local',
      tokenProvider: new InsecureTokenProvider('fooBar', user),
      orderer: 'http://localhost:7070',
      storage: 'http://localhost:7070',
    };
```

As we can see, the `tokenProvider` value here is now an `FrsAzFunctionTokenProvider` which will make a request to an Azure function to return a signed token for the provided user. This is done so that the tenant key, that is also provided during FRS onboarding, does not need to be stored on client-side code. Instead, the Azure function is responsible for fetching the appropriate key for the `tenantId` we provided and signing the token using it. Please see [this repo](https://github.com/microsoft/FrsAzureFunctions) to clone an example Azure function that provides the API that this token provider would use.

Once our Azure function is set up, we just need to pass in the URL for it to the `FrsAzFunctionTokenProvider` constructor.

After filling these values in, run the following commands in a terminal window:

```
npm i
npm run start:frs
```

NOTE: It is possible to insecurely run the application against FRS without an Azure function. However, this risks exposing the tenant key in the client-side code and should only be used for testing purposes, like so:

```typescript
const connectionConfig = {
  tenantId: 'YOUR-TENANT-ID-HERE',
  tokenProvider: new InsecureTokenProvider('YOUR-TENANT-KEY-HERE', user),
  orderer: 'YOUR-ORDERER-URL-HERE',
  storage: 'YOUR-STORAGE-URL-HERE',
};
```

Please replace this with another implementation of the `ITokenProvider`, such as the `FrsAzFunctionTokenProvider` that will not expose the tenant key in the client code itself.

### Deploy the app

To deploy this application and get a URL that we can share with other people in a non-local context, we will be using an Azure App Service.

NOTE: These instructions are for deploying the front-end web application that we are building in this repo, not the backend FRS instance itself. Obtaining an already deployed FRS tenant ID is a pre-requisite for this as the local Tinylicious service instance will not work for remote deployments.

#### Pre-requisites

- An Azure subscription is required in order to deploy the app service. If you do not already have one, please see the [Microsoft Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program) page to see how you can set a new one 

We also need to set up the app to connect to FRS using the instructions identified above. The requirements for them are:
- An FRS tenant ID, orderer URL, and storage URL. This will have been provided to you as part of the FRS onboarding process
- An Azure Function that will be used to request the JWT token to authenticate against FRS. This URL for this will either be provided for you with the FRS onboarding information or you can set one up yourself similar to [here](https://github.com/microsoft/FrsAzureFunctions)

#### Bundling app code

Once you have completed local development using the instructions above, we need to first prepare the JS bundle to send to the app service. For this, please run the following command from the root directory:

`npm run build`

This will package the application in the form where it was connected to FRS, i.e. while running `npm run start:frs` before.

Now, we should see a new `/build` folder in our application root directory holding the JS bundle. 

#### Creating an App Service

To send it to our app service, we will be using the [Azure App Service VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)

Once you've logged in to your Azure account on the extension, please use the following steps to create a new [app service](https://docs.microsoft.com/en-us/azure/app-service/overview) (if you already have one created, you can skip these):
1. Use Ctrl+Shift+P to open the command palette.

2. Enter "create web" then select Azure App Service: Create New Web App...Advanced.

<img src='https://user-images.githubusercontent.com/7992711/128751839-e87557a9-5dfc-4c19-a015-201c61f9c88d.PNG' >

3. You use the advanced command to have full control over the deployment including resource group, App Service Plan, and operating system rather than use Linux defaults.

Respond to the prompts as follows:

- Select your Subscription account.
- For "Enter a globally unique name", enter a name that's unique across all of Azure. Use only alphanumeric characters ('A-Z', 'a-z', and '0-9') and hyphens ('-')
- Select "Create new resource group" and provide a name like "TutorialApp-rg".
- Select the Windows operating system.
- Select "Create a new App Service plan", provide a name like "TutorialApp-plan", and select the "F1 Free" pricing tier.
- Select "Skip for now" for the Application Insights resource.
- Select a location near you.
- After a short time, VS Code notifies you that creation is complete. Close the notification with the X button.

#### Deploying app code

Once the app has been created (or if you're using an existing one), right-click on it in the list of App Services within the extension pane.
Then, select the option "Deploy to Web App...".

<img src='https://user-images.githubusercontent.com/7992711/128751799-bde5ebd0-7e4f-46a6-8059-14390c62460a.PNG' width=50% height=50%>

This will bring up a prompt to "Select the folder to deploy". Browse to the `./build` folder and select it.

<img src='https://user-images.githubusercontent.com/7992711/128751719-970d4502-f3df-4feb-9a57-31769d19e14f.PNG' width=50% height=50%>

You should now see a notification indicating that deployment is commencing and you can view the output in a terminal window.

<img src='https://user-images.githubusercontent.com/7992711/128751666-8cc2e3ba-8fc1-4741-818a-8926e70cc9b0.PNG' >

Once it is completed, click on "Browse Website" to open up the app home page.

<img src='https://user-images.githubusercontent.com/7992711/128751550-eab7bd7d-8700-47b2-82b2-7b180f8121e6.PNG' >

Now, you can start sharing links for different created containers. After clicking on "Create" from the home page, the app url will be of the format `https://{YOUR-APPSERVICE-NAME}.azurewebsites.net/fluid/{CONTAINER-ID}`. Any users who have the page open with the same container ID should now be able to collaborate with one another!

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
