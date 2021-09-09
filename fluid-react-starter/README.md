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

To add another DDS to this list, make sure that the DDS is imported from `fluid-framework`, select a key, and add the DDS to `initialObjects`.

```ts
import { SharedMap, SharedCounter } from 'fluid-framework';

export const containerSchema = {
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

All of your application's business logic will be stored in `model.ts`, which is a class with access to both the `FluidContainer` and the `TinyliciousContainerServices`. 

In the `FluidModel` class you can expose new properties and methods that can leverage any of the DDSes provided by your `FluidContainer` or `TinyliciousContainerServices` properties, like `audience`. These properties and methods will be used to provide a `store` of data and actions for your view to access, so keep the model focused on lower level access of the data itself.

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

This template is written to funnel all model events through the `modelChanged` event. Each event emit accepts a payload that can used to differentiate one event from another. 

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
