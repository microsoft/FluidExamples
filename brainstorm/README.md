# Lets Brainstorm

```
This example is using an experimental API surface so please be cautious. We will break it!
```

Brainstorm is an example of using the Fluid Framework to build a collaborative line of business application. In this example each user can create their own sticky notes that is managed on a board.

This application was shown during a [Microsoft Build session](https://aka.ms/OD522).

## Getting Started

### To run this follow the steps below for local mode (Tinylicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npx tinylicious` to start the "Tinylicious" test service
3. Run `npm run start` to start the client
5. Navigate to `http://localhost:3000` in a browser tab

<br />
| :memo: NOTE                                                                                              |
|:---------------------------------------------------------------------------------------------------------|
| Tinylicious is a local, self-contained test service. By running `npx tinylicious` from your terminal window will launch the Tinylicious server. The server will need to be started first in order to provide the ordering and storage requirement of Fluid runtime.                                                         |
<br />

### To run this follow the steps below for remote mode (Routerlicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npm run start:frs` to start the "Routerlicious" test service
5. Navigate to `http://localhost:3000` in a browser tab

| :memo: NOTE                                                                                              |
|:---------------------------------------------------------------------------------------------------------|
| Routerlicious is a main composed server definition that pulls together multiple micro-services that provide the ordering and storage requirement of Fluid runtime. By running `npm run start:frs` from your terminal window, the environment variable `REACT_APP_FLUID_CLIENT` will be set first, which will be picked up by the `useFrs` flag, and `FrsConnectionConfig` will use the remote mode config format. Then, the command will starts the server.                                                                            |

This package is based on the [Create React App](https://reactjs.org/docs/create-a-new-react-app.html), so much of the Create React App documentation applies.

## Using the Brainstorm App

1. Navigate to `http://localhost:3000`

You'll be taken to a url similar to 'http://localhost:3000/**#1621961220840**' the path `##1621961220840` is specifies one brainstorm document.

2. Create another chrome tab with `http://localhost:3000/**#1621961220840**`

Now you can create notes, write text, change colors and more!

## Connecting to the Service
By configuring the `FrsConnectionConfig` that we pass into the `FrsClient` instance, we can connect to both live FRS and Tinylicious instances. The `FrsConnectionConfig` is defined by the `connectionConfig` constant in [Config.ts](./src/Config.ts), which specifies the tenant ID, orderer and storage. By setting the tenant ID as "local", we allow for the `FrsClient` to run against Tinylicious for development purpose.

- Running `FrsClient` against local Tinylicious instance
    - To run against our local Tinylicious instance, we pass the `tenantId` as "local" and make use of `InsecureTokenProvider`. The `InsecureTokenProvider` requires we pass in two values to its constructor, a key string, which can be anything since we are running it locally, and an IUser type object identifying the current user. For running the instance locally, the orderer and storage URLs would point to the Tinylicious instance on the default values of `http://localhost:7070`.

- Running `FrsClient` against live FRS instance
    - To run against live FRS Instance, tenant ID, orderer and storage URLs are required. We make use of `FrsAzFunctionTokenProvider` which takes in the Azure function URL and an optional `IUser` type object identifying the current user, thereby making an axios `GET` request call to the Azure Function. This axios call takes in the tenant ID, documentId and userID/userName as optional parameters. The Azure Function is responsible for mapping the `tenantId` to tenant key secret to generate and sign the token such that the service will accept it.

To add more versatility, we also incorporated the `useFrs` flag. Depending on the npm command you run (`npm run start` or `npm run start:frs`), the flag will toggle between local and remote mode using the same config format. We make use of `FrsAzFunctionTokenProvider` for running against live FRS instance since it is more secured, without exposing the tenant secret key in the client-side code whereas while running the service locally for development purpose, we make use of `InsecureTokenProvider`.

```ts
export const connectionConfig: FrsConnectionConfig = useFrs ? {
    tenantId: "YOUR-TENANT-ID-HERE",
    tokenProvider: new FrsAzFunctionTokenProvider("AZURE-FUNCTION-URL"+"/api/GetFrsToken", { userId: "test-user", userName: "Test User" }),
    orderer: "ENTER-ORDERER-URL-HERE",
    storage: "ENTER-STORAGE-URL-HERE",
} : {
        tenantId: "local",
        tokenProvider: new InsecureTokenProvider("fooBar", user),
        orderer: "http://localhost:7070",
        storage: "http://localhost:7070",
    };
```

## Using `SharedMap` and Prefix Structure to Update Note States
To keep track of changes made to individual notes, the LetsBrainstorm app make use of the `SharedMap` data structure from `FluidContainer` and the prefix structure.

`SharedMap`, specified in `containerSchema`'s `initialObjects` property in [Config.ts](./src/Config.ts), will be loaded into memory when the `FluidContainer` is loaded and you can access them off the `FluidContainer` via the `initialObjects` property.

The [BrainstormModel](./src/BrainstormModel.ts) defines various functions that are available to a note, including creating and deleting a note, getting likes, moving the note in the note space, changing the note text, and etc. These functions achieve their tasks by making changes to the properties associated with the note. All note properties, such as `noteId`s, `author`, `color`, `postition`, etc, are stored in a `SharedMap` as key-value pairs for easy retrieval. Now, to differentiate between different properties and notes, we make use of a prefix structure, where each key contains a prefix that indicates which property this key-value pair holds and for which note. 

```ts
sharedMap.set(c_AuthorPrefix + noteId, newCardData.author);
```

| :warning: WARNING                                                                                        |
|:---------------------------------------------------------------------------------------------------------|
| Do not try to modify the local state directly as it won't cause any changes for remote clients           |


While all the property prefixes are static, by attaching unique `noteId` to the end of the property prefix, we ensured that properties for each note are stored individually. Furthermore, with the use of `SharedMap`, state of each note can be updated promptly in real-time.

## Using Audience to Render User Information
The LetsBrainstorm app make use of the audience property from `FrsContainerServices` to keep track of and render all user related information. 

In the [BrainstormView](./src/BrainstormView.tsx), the audience property is used to display all active users currently in the session. It is also used to retrieve current user information so the user can be assigned as the author accordingly, such as when the user creates a note.
