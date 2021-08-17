# Lets Brainstorm

```
This example is using an experimental API surface so please be cautious. We will break it!
```

Brainstorm is an example of using the Fluid Framework to build a collaborative line of business application. In this example each user can create their own sticky notes that is managed on a board.

This application was shown during a [Microsoft Build session](https://aka.ms/OD522).

## Getting Started

### Follow the steps below to run this in local mode (Tinylicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npx tinylicious` to start the "Tinylicious" test service
3. Run `npm run start` to start the client
5. Navigate to `http://localhost:3000` in a browser tab

<br />

| :memo: NOTE                                                                                              |
|:---------------------------------------------------------------------------------------------------------|
| Tinylicious is a local, self-contained test service. By running `npx tinylicious` from your terminal window will launch the Tinylicious server. The server will need to be started first in order to provide the ordering and storage requirement of Fluid runtime.                                                         |

<br />

### Follow the steps below to run this in remote mode (Routerlicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npm run start:frs` to start the "Routerlicious" test service
5. Navigate to `http://localhost:3000` in a browser tab

<br />

| :memo: NOTE                                                                                              |
|:---------------------------------------------------------------------------------------------------------|
| Routerlicious is a main composed server definition that pulls together multiple micro-services that provide the ordering and storage requirement of Fluid runtime. By running `npm run start:frs` from your terminal window, the environment variable `REACT_APP_FLUID_CLIENT` will be set first, which will be picked up by the `useFrs` flag, and `FrsConnectionConfig` will use the remote mode config format. Then, the command will starts the server.                                                                            |

<br />

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
    - To run against live FRS Instance, tenant ID, orderer and storage URLs are required. We make use of `FrsAzFunctionTokenProvider` which takes in the Azure function URL and an optional `"userId" | "userName" | "additionalDetails"` type object identifying the current user, thereby making an axios `GET` request call to the Azure Function. This axios call takes in the tenant ID, documentId and userID/userName as optional parameters. The Azure Function is responsible for mapping the `tenantId` to tenant key secret to generate and sign the token such that the service will accept it.

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

- `SharedMap` and The State Update Loop
    - The [BrainstormModel](./src/BrainstormModel.ts) defines various functions that are available to a note, including creating and deleting a note, getting likes, moving the note in the note space, changing the note text, and etc. These functions achieve their tasks by making changes to the properties associated with the note. All note properties, such as `noteId`s, `author`, `color`, `postition`, etc, are stored in a `SharedMap` as key-value pairs for easy retrieval. Now, the usage of a `SharedMap` allows us to update the note states locally and have the changes sync with `SharedMap` and propagate to all remote client views. This is done by the function `setChangeListener()`, where a listener is attached to the `SharedMap` and listens for any `valueChanged` event. The `useEffect()` hook in [NoteSpace.tsx](./src/view/NoteSpace.tsx) updates the React state holding the local notes with the function `syncLocalAndFluidState()`, then the `setChangeListener()` is called to continue listening and update local state of all notes.

<br />

| :warning: WARNING                                                                                        |
|:---------------------------------------------------------------------------------------------------------|
| Do not try to modify the local state directly outside of the `useEffect` hook, it will not cause any changes for remote clients.                                                                                |

<br />

- Using `SharedMap` with The Prefix Structure
    - With different properties stored in the `SharedMap` as key-value pairs, we make use of a prefix structure to differentiate between different properties and notes. Each key contains a prefix that indicates which property this key-value pair holds and for which note. 

    ```ts
    sharedMap.set(c_AuthorPrefix + noteId, newCardData.author);
    ```

    As shown above, a static prefix is attached to indicate which property this entry holds (`noteId`, `author`, `color`, etc), then to ensure the key is unique for each note, we attach the `noteId` after the static prefix. With this structure, we now ensured that properties for each note are stored individually.

To summarize how these 2 components work together seamlessly, take `setNoteColor()` in [BrainstormModel](./src/BrainstormModel.ts) as example. This method is passed down to its view component, [NoteSpace.tsx](./src/view/NoteSpace.tsx), through props. As the name suggests, this method gets triggered whenever user changes the color of the note. When the color button is selected by the user, the method takes the key (`c_ColorPrefix` + `noteId`) and sets the `SharedMap` value to the desired color value. Now that a `SharedMap` key-value pair is changed, the `valueChanged` event is then triggered from `setChangeListener()`, and the listener calls the `syncLocalAndFluidState()` method defined in the `useEffect` hook. The `syncLocalAndFluidState()` method then generates new `notes` state with the following procedure:

1. Get the `NoteIds` from the map
2. Use the IDs as prefixes in `createNote()` to load the data for each individual note. 
    - `createNote()` will take the `noteId` that's passed in as argument to retrieve each note property from `SharedMap` and populate the new note. Attributes like `didLikeThisCalculated` also filters the retrieved value by `user` and `noteId` to generate unique view from the user's perspective.
3. Apply a state update with our list of new notes.
    - With our newly generated and updated list of new notes, we call `setNotes` to update the React state. This updated React state will propagate the changes to all remote clients, resulting in the view updating.

## Using Audience to Render User Information
The LetsBrainstorm app make use of the `audience` property from `FrsContainerServices` to keep track of and render all user related information. 

In the [BrainstormView](./src/BrainstormView.tsx), the audience property is used to achieve 2 tasks, display all active users currently in the session, and retrieve current user information so the user can be assigned as the author accordingly, such as when the user creates a note.

Similar to how `BrainstormModel` works in [NoteSpace.tsx](./src/view/NoteSpace.tsx), the member values of the audience property is also being tracked as a React state.

```ts
const [members, setMembers] = React.useState(Array.from(audience.getMembers().values()));
```

Just like `setChangeListener()` calling `syncLocalAndFluidState()` on a `valueChanged` event described in the previous section, a listener on the `audeince.getMembers()` property is actively listening for a `"membersChanged"` event. When the event occurs, the listener will call the `setMembersCallback()` method.

```ts
const setMembersCallback = React.useCallback(() => setMembers(
    Array.from(
      audience.getMembers().values()
    )
  ), [setMembers, audience]);
```

The `setMembersCallback()` retreives a list of all the active members and convert it to an array. This array is then used by `setMembers` to update the React state of active users when new clients join or leave the session.

Now, audience also has a `getMyself()` property to get the current client as a member. By passing this into the view as props, this allows the user to be assigned as author whenever the user creates a note.

```ts
const authorInfo = audience.getMyself();
```


