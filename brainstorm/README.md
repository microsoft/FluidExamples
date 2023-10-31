# Let's Brainstorm

Brainstorm is an example of using the Fluid Framework to build a collaborative line of business application.
In this example each user can create their own sticky notes that are managed on a board.

This application was shown during a [Microsoft Build session](https://aka.ms/OD522).

## Getting Started

This package is based on the [Create React App](https://reactjs.org/docs/create-a-new-react-app.html), so much of the Create React App documentation applies.

### Local Mode

`@fluidframework/azure-local-service` is a local, self-contained test service.
Running `npx @fluidframework/azure-local-service` from your terminal window will launch the Azure local server.
The server will need to be started first in order to provide the ordering and storage requirement of Fluid runtime.

Follow the steps below to run this in local mode (Azure local service):

1. Run `npm install` from the brainstorm folder root
2. Run `npm run start:server` to start the Azure local service for testing and development
3. Run `npm start` to start the client
4. Navigate to `http://localhost:3000` in a browser tab

### Remote Mode

Azure Fluid Relay service is a deployed service implementation that pulls together multiple micro-services that provide the ordering and storage requirement of Fluid runtime.
By running `npm run start:azure` from your terminal window, the environment variable `REACT_APP_FLUID_CLIENT` will be set first, which will be picked up by the `useAzure` flag, and `AzureConnectionConfig` will use the remote mode config format.
Please use the values provided as part of the service onboarding process to fill in this configuration.
Then, the command will connect to your service instance.

Follow the steps below to run this in remote mode (Routerlicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npm run start:azure` to connect to the Azure Fluid Relay service
3. Navigate to `http://localhost:3000` in a browser tab

## Using the Brainstorm App

1. Navigate to `http://localhost:3000`
    - You'll be taken to a URL similar to `http://localhost:3000/**#1621961220840**` the path `#1621961220840` specifies one brainstorm document.
2. Navigate to the same URL in another window or tab
    - Now you can create notes, write text, change colors and more!

## Connecting to the Service

By configuring the `AzureConnectionConfig` that we pass into the `AzureClient` instance, we can connect to both live Azure Fluid Relay and local instances.
The `AzureConnectionConfig` is defined by the `connectionConfig` constant in [Config.ts](./src/Config.ts), which specifies the tenant ID, orderer and storage.

Now, before you can access any Fluid data, you need to define your container schema after creating a configured `AzureClient` using `AzureConnectionConfig`.

-   `containerSchema`, also defined in [Config.ts](./src/Config.ts), is going to include a collection of the data types our application will use.

```ts
export const containerSchema = {
	initialObjects: {
		map: SharedMap,
	},
};
```

Inside [index.tsx](./src/index.tsx), we defined a `start()` function that uses `getContainerId()` to check for the container ID in the URL and determine if this is an existing document (`getContainer()`) or if we need to create a new one (`createContainer()`).
When creating a new container, we get its ID from the `container.attach()` call.

```ts
export async function start() {
        initializeIcons();

    const getContainerId = (): { containerId: string; isNew: boolean } => {
        let isNew = false;
        if (location.hash.length === 0) {
            isNew = true;
        }
        const containerId = location.hash.substring(1);
        return { containerId, isNew };
    };

    const { containerId, isNew } = getContainerId();

    const client = new AzureClient(connectionConfig);

    let container: IFluidContainer;
    let services: AzureContainerServices;

    if (isNew) {
        ({ container, services } = await client.createContainer(containerSchema));
        const containerId = await container.attach();
        location.hash = containerId;
    } else {
        ({ container, services } = await client.getContainer(containerId, containerSchema));
    }
    ...
}
```

Since `start()` is an async function, we'll need to await for the initialObjects to be returned.
Once returned, each `initialObjects` key will point to a connected data structure as defined in the schema.

### Running `AzureClient` against local service instance

-   To run against our local service instance, we make use of `InsecureTokenProvider`.
    The `InsecureTokenProvider` requires we pass in two values to its constructor, a key string, which can be anything since we are running it locally, and an `IUser` type object identifying the current user.
    For running the instance locally, the orderer and storage URLs would point to the local service instance on the default values of `http://localhost:7070`.

### Running `AzureClient` against live Azure Fluid Relay service instance

-   To run against live Azure Instance, we make use of `AzureFunctionTokenProvider` which takes in the Azure function URL and an optional `"userId" | "userName" | "additionalDetails"` type object identifying the current user, thereby making an axios `GET` request call to the Azure Function.
    This axios call takes in the tenant ID, documentId and userID/userName as optional parameters.
    The Azure Function is responsible for mapping the `tenantId` to tenant key secret to generate and sign the token such that the service will accept it.

To add more versatility, we also incorporated the `useAzure` flag. Depending on the npm command you run (`npm run start` or `npm run start:azure`), the flag will toggle between local and remote mode using the same config format. We make use of `AzureFunctionTokenProvider` for running against live Azure instance since it is more secured, without exposing the tenant secret key in the client-side code whereas while running the service locally for development purpose, we make use of `InsecureTokenProvider`.

```ts
export const connectionConfig: AzureConnectionConfig = useAzure
	? {
			tenantId: "YOUR-TENANT-ID-HERE",
			tokenProvider: new AzureFunctionTokenProvider(
				"AZURE-FUNCTION-URL" + "/api/GetAzureToken",
				{ userId: "test-user", userName: "Test User" },
			),
			orderer: "ENTER-ORDERER-URL-HERE",
			storage: "ENTER-STORAGE-URL-HERE",
	  }
	: {
			tenantId: "local",
			tokenProvider: new InsecureTokenProvider("fooBar", user),
			orderer: "http://localhost:7070",
			storage: "http://localhost:7070",
	  };
```

## Using `SharedMap` and Prefix Structure to Update Note States

To keep track of changes made to individual notes, the LetsBrainstorm app makes use of the `SharedMap` data structure from `FluidContainer` and a prefix-based structuring of our data for tracking different properties.

`SharedMap`, specified in `containerSchema`'s `initialObjects` property in [Config.ts](./src/Config.ts), will be loaded into memory when the `FluidContainer` is loaded and you can access them off the `FluidContainer` via the `initialObjects` property.

### Syncing `SharedMap` and View data

The [BrainstormModel](./src/BrainstormModel.ts) defines various functions that are available to a note, including creating and deleting a note, getting likes, moving the note in the note space, changing the note text, and etc.
These functions achieve their tasks by making changes to the properties associated with the note.
All note properties, such as `noteId`s, `author`, `color`, `postition`, etc, are stored in a `SharedMap` as key-value pairs for easy retrieval.
Now, syncing our Fluid and View data requires that we set up an event listener, which mean we need a `useEffect()` hook, defined in [NoteSpace.tsx](./src/view/NoteSpace.tsx).

```ts
const [notes, setNotes] = React.useState<readonly NoteData[]>([]);

// This runs when via model changes whether initiated by user or from external
React.useEffect(() => {
	const syncLocalAndFluidState = () => {
		const noteDataArr = [];
		const ids: string[] = model.NoteIds;

		// Recreate the list of cards to re-render them via setNotes
		for (let noteId of ids) {
			const newCardData: NoteData = model.CreateNote(noteId, props.author);
			noteDataArr.push(newCardData);
		}
		setNotes(noteDataArr);
	};

	syncLocalAndFluidState();
	model.setChangeListener(syncLocalAndFluidState);
	return () => model.removeChangeListener(syncLocalAndFluidState);
}, [model, props.author]);
```

To sync the data, we created a `syncLocalAndFluidState()` function, called that function once to initialize the data, and then keep listening for the `SharedMap` "valueChanged" event in `setChangeListener()`, and fire the function again each time. Now React will handle updating the view each time the new `notes` state is modified.

<br />

| :warning: WARNING |
| :---------------- |

| Do not try to modify the local state directly outside of the `useEffect` hook, it will not cause any changes for remote clients.

<br />

### Using `SharedMap` with The Prefix Structure

With different properties stored in the `SharedMap` as key-value pairs, we make use of a prefix structure to differentiate between different properties and notes. Each key contains a prefix that indicates which property this key-value pair holds and for which note.

```ts
sharedMap.set(c_AuthorPrefix + noteId, newCardData.author);
```

As shown above, a static prefix is attached to indicate which property this entry holds (`noteId`, `author`, `color`, etc), then to ensure the key is unique for each note, we attach the `noteId` after the static prefix. With this structure, we now ensured that properties for each note are stored individually.

<br />

| :warning: WARNING |
| :---------------- |

| `SharedMap` does not preserve object references like a conventional map data structure, and object comparisons of `SharedMap` values will be invalid . In this case, it is recommended to only store the necessary primitive data types in `SharedMap` or implement a custom comparison function.

<br />

### Example Walk-through

To summarize how these 2 components work together seamlessly, let's take `setNoteColor()` in [BrainstormModel](./src/BrainstormModel.ts) as example. This method is passed down to its view component, [NoteSpace.tsx](./src/view/NoteSpace.tsx), through props. As the name suggests, this method gets triggered whenever user changes the color of the note. When the color button is selected by the user, the method takes the key (`c_ColorPrefix` + `noteId`) and sets the `SharedMap` value to the desired color value. Now that a `SharedMap` key-value pair is changed, the "valueChanged" event is then triggered from `setChangeListener()`, and the listener fires the `syncLocalAndFluidState()` function defined in the `useEffect` hook. The function then generates new `notes` state with the following procedure:

1. Get the `NoteIds` from the map
2. Use the IDs as prefixes in `createNote()` to load the data for each individual note.
    - `createNote()` will take the `noteId` that's passed in as argument to retrieve each note property from `SharedMap` and populate the new note. Note property like `didLikeThisCalculated` is done by filtering the retrieved value by `user` and `noteId` to generate unique view from the user's perspective.
3. Apply a state update with our list of new notes.
    - With our newly generated and updated list of new notes, we call `setNotes` to update the React state. This updated React state will propagate the changes to all remote clients, resulting in the view updating.

## Using Audience to Render User Information

The Brainstorm app makes use of the `audience` property from `AzureContainerServices` to keep track of and render all user related information.

In the [BrainstormView](./src/BrainstormView.tsx), the audience property is used similarly to how `BrainstormModel` works in [NoteSpace.tsx](./src/view/NoteSpace.tsx). The member values of the audience property are also being tracked in a React state so we can display all the active users in the session.

With audience Fluid data and View data, we again, need to set up an event listener, which mean we also need a `useEffect()` hook.

```ts
const [members, setMembers] = React.useState(Array.from(audience.getMembers().values()));

const setMembersCallback = React.useCallback(
	() => setMembers(Array.from(audience.getMembers().values())),
	[setMembers, audience],
);

React.useEffect(() => {
	fluidContainer.on("connected", setMembersCallback);
	audience.on("membersChanged", setMembersCallback);
	return () => {
		fluidContainer.off("connected", () => setMembersCallback);
		audience.off("membersChanged", () => setMembersCallback);
	};
}, [fluidContainer, audience, setMembersCallback]);
```

To sync the data, we created a `setMembersCallback()` function, which retrieves a list of all the active members and convert it to an array, then have a listener keep listening for the "membersChanged" event, and fire the function each time. Now React will handle updating the view each time the new `members` state is modified.

The audience object also has a `getMyself()` function that returns the current client as a member.
This is passed in as a view prop so that the user information can be displayed or processed when the user performs different note operations (creating a note, liking a note, and editing a note).

```ts
const authorInfo = audience.getMyself();
```

With `members` and `authorInfo` defined, we use these to achieve several tasks:

1. displaying all current active users
    - All current active users are displayed as FacePile, or a list of personas, on the top right corner of the app.
2. displaying author name in persona tooltip
    - When hovering over the note's persona, the author who created the name will be displayed dynamically.
3. displaying likes for the note
    - When hovering over the like button, a list of all the users that liked the note will be shown.
4. displaying the note's last edited user
    - Once there are no changes to the note's content, the last edited author will be determined and shown at the bottom of the note.
