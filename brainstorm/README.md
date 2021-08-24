# Lets Brainstorm

Brainstorm is an example of using the Fluid Framework to build a collaborative line of business application. In this example each user can create their own sticky notes that is managed on a board.

This application was shown during a [Microsoft Build session](https://aka.ms/OD522).

## Getting Started

Follow the steps below to run this in local mode (Tinylicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npx tinylicious` to start the "Tinylicious" test service
3. Run `npm run start` to start the client
4. Navigate to `http://localhost:3000` in a browser tab

<br />

| :memo: NOTE                                                                                                                                             |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tinylicious is a local, self-contained test service. Running `npx tinylicious` from your terminal window will launch the Tinylicious server. The server will need to be started first in order to provide the ordering and storage requirement of Fluid runtime.

<br />

Follow the steps below to run this in remote mode (Routerlicious):

1. Run `npm install` from the brainstorm folder root
2. Run `npm run start:frs` to connect to the Azure Fluid Relay service
3. Navigate to `http://localhost:3000` in a browser tab

<br />

| :memo: NOTE                                                                                                                                             |
:---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Azure Fluid Relay service is a deployed service implementation that pulls together multiple micro-services that provide the ordering and storage requirement of Fluid runtime. By running `npm run start:frs` from your terminal window, the environment variable `REACT_APP_FLUID_CLIENT` will be set first, which will be picked up by the `useFrs` flag, and `FrsConnectionConfig` will use the remote mode config format. Please use the values provided as part of the service onboarding process to fill in this configuration. Then, the command will connect to your service instance.

<br />

This package is based on the [Create React App](https://reactjs.org/docs/create-a-new-react-app.html), so much of the Create React App documentation applies.

## Using the Brainstorm App

1. Navigate to `http://localhost:3000`

You'll be taken to a url similar to 'http://localhost:3000/**#1621961220840**' the path `##1621961220840` is specifies one brainstorm document.

2. Create another chrome tab with `http://localhost:3000/**#1621961220840**`

Now you can create notes, write text, change colors and more!

## Connecting to the Service
By configuring the `FrsConnectionConfig` that we pass into the `FrsClient` instance, we can connect to both live FRS and Tinylicious instances. The `FrsConnectionConfig` is defined by the `connectionConfig` constant in [Config.ts](./src/Config.ts), which specifies the tenant ID, orderer and storage. 

Now, before you can access any Fluid data, you need to define your container schema after creating a configured `FrsClient` using `FrsConnectionConfig`.

- `containerSchema`, also defined in [Config.ts](./src/Config.ts), is going to include a string `name` and a collection of the data types our application will use.
```ts
export const containerSchema = {
    name: "brainstorm",
    initialObjects: {
        map: SharedMap,
    },
}
```

Inside [index.tsx](./src/index.tsx), we defined a `start()` function that uses `getContainerId()` to return a unique ID and determine if this is an existing document (`getContainer()`) or if we need to create a new one (`createContainer()`).

```ts
export async function start() {
    initializeIcons();
    const getContainerId = (): { containerId: string; isNew: boolean } => {
        let isNew = false;
        if (location.hash.length === 0) {
            isNew = true;
            location.hash = Date.now().toString();
        }
        const containerId = location.hash.substring(1);
        return { containerId, isNew };
    };

    const { containerId, isNew } = getContainerId();

    const client = new FrsClient(connectionConfig);

    const frsResources = isNew
        ? await client.createContainer({ id: containerId }, containerSchema)
        : await client.getContainer({ id: containerId }, containerSchema);
    ...
}
```

Since `start()` is an async function, we'll need to await for the initialObjects to be returned. Once returned, each `initialObjects` key will point to a connected data structure as defined in the schema.

### Running `FrsClient` against local Tinylicious instance
- To run against our local Tinylicious instance, we pass the `tenantId` as "local" and make use of `InsecureTokenProvider`. The `InsecureTokenProvider` requires we pass in two values to its constructor, a key string, which can be anything since we are running it locally, and an IUser type object identifying the current user. For running the instance locally, the orderer and storage URLs would point to the Tinylicious instance on the default values of `http://localhost:7070`.

### Running `FrsClient` against live FRS instance
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
To keep track of changes made to individual notes, the LetsBrainstorm app makes use of the `SharedMap` data structure from `FluidContainer` and a prefix-based structuring of our data for tracking different properties.

`SharedMap`, specified in `containerSchema`'s `initialObjects` property in [Config.ts](./src/Config.ts), will be loaded into memory when the `FluidContainer` is loaded and you can access them off the `FluidContainer` via the `initialObjects` property.

### Syncing `SharedMap` and View data
The [BrainstormModel](./src/BrainstormModel.ts) defines various functions that are available to a note, including creating and deleting a note, getting likes, moving the note in the note space, changing the note text, and etc. These functions achieve their tasks by making changes to the properties associated with the note. All note properties, such as `noteId`s, `author`, `color`, `postition`, etc, are stored in a `SharedMap` as key-value pairs for easy retrieval. Now, syncing our Fluid and View data requires that we set up an event listener, which mean we need a `useEffect()` hook, defined in [NoteSpace.tsx](./src/view/NoteSpace.tsx).
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

| :warning: WARNING                                                                                                                                       |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Do not try to modify the local state directly outside of the `useEffect` hook, it will not cause any changes for remote clients.

<br />

### Using `SharedMap` with The Prefix Structure
With different properties stored in the `SharedMap` as key-value pairs, we make use of a prefix structure to differentiate between different properties and notes. Each key contains a prefix that indicates which property this key-value pair holds and for which note.
```ts
sharedMap.set(c_AuthorPrefix + noteId, newCardData.author);

```
As shown above, a static prefix is attached to indicate which property this entry holds (`noteId`, `author`, `color`, etc), then to ensure the key is unique for each note, we attach the `noteId` after the static prefix. With this structure, we now ensured that properties for each note are stored individually.

### Example Walk-through
To summarize how these 2 components work together seamlessly, let's take `setNoteColor()` in [BrainstormModel](./src/BrainstormModel.ts) as example. This method is passed down to its view component, [NoteSpace.tsx](./src/view/NoteSpace.tsx), through props. As the name suggests, this method gets triggered whenever user changes the color of the note. When the color button is selected by the user, the method takes the key (`c_ColorPrefix` + `noteId`) and sets the `SharedMap` value to the desired color value. Now that a `SharedMap` key-value pair is changed, the "valueChanged" event is then triggered from `setChangeListener()`, and the listener fires the `syncLocalAndFluidState()` function defined in the `useEffect` hook. The function then generates new `notes` state with the following procedure:

1. Get the `NoteIds` from the map
2. Use the IDs as prefixes in `createNote()` to load the data for each individual note. 
    - `createNote()` will take the `noteId` that's passed in as argument to retrieve each note property from `SharedMap` and populate the new note. Note property like `didLikeThisCalculated` is done by filtering the retrieved value by `user` and `noteId` to generate unique view from the user's perspective.
3. Apply a state update with our list of new notes.
    - With our newly generated and updated list of new notes, we call `setNotes` to update the React state. This updated React state will propagate the changes to all remote clients, resulting in the view updating.

## Using Audience to Render User Information
The LetsBrainstorm app make use of the `audience` property from `FrsContainerServices` to keep track of and render all user related information. Namely, we use `audience` to create a list of active members in the session and retrieve user information.

In the [BrainstormView](./src/BrainstormView.tsx), the audience property is used similarly to how `BrainstormModel` works in [NoteSpace.tsx](./src/view/NoteSpace.tsx), the member values of the audience property are also being tracked in a React state so we can display all the active users in the session.

With audience Fluid data and View data, we again, need to set up an event listener, which mean we also need a `useEffect()` hook.

```ts
const [members, setMembers] = React.useState(Array.from(audience.getMembers().values()));

const setMembersCallback = React.useCallback(() => setMembers(
    Array.from(
      audience.getMembers().values()
    )
  ), [setMembers, audience]);

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

Now, audience also has a `getMyself()` property to get the current client as a member. Passing this into the view as props will allows the user information to be displayed or processed when the user performs different note operations (creating a note, liking a note, and editing a note).

```ts
const authorInfo = audience.getMyself();
```

With `members` and `authorInfo` defined, we can used these to achieve couple of tasks:

1. displaying all current active users
2. displaying author name in persona tooltip 
3. displaying like and the note's liked users
4. displaying the note's last edited user

### 1. Displaying All Current Actuve Users
To display all active members in the session, we are using the `Facepile` element from `@fluentui/react`. This element will display all the active members in their respective personas. The persona will display the image if the user has one, otherwise, it will display the first letter of their names. Now, in order to use the `Facepile` element, we first pass the `member` variable into our `Header` element, defined [here](./src/view/Header.tsx), as argument.

```ts
return (
    <div className={wrapperClass}>
      <Header
        model={model}
        author={authorInfo}
        members={members}
      />
      <DndProvider backend={HTML5Backend}>
        <NoteSpace
          model={model}
          author={authorInfo}
        />
      </DndProvider>
    </div>
  );
```
The `Facepile` element requires that we pass in an array `IFacepilePersona[]`. To do that, we need to convert `members` to the desired format.

```ts
const personas = React.useMemo(() => props.members.map(member => {return { personaName: member.userName}}), [props.members]);
```

We use the map function of the array to extract each member's `userName` and map it to an object literal with `personaName` property, to match the `IFacepilePersona` definition. Notice the use of `React.useMemo` allows us to only recompute the memoized value when one of the value has changed.

With the required personas array created, we not pass it into the the `Facepile` element.

```ts
const farItems: ICommandBarItemProps[] = [
    {
      key: "presence",
      onRender: () => <Facepile
      styles={{ root: { alignSelf: "center" } }}
      personas={personas}
    />,
    },
  ];
```

### 2. Displaying Author Name in Persona Tooltip
Like mentioned earlier, `authorInfo` is created for the current user information to interact with different note operations. Here we will focus on assigning the user as author when creating a note and displaying the author's name as tooltip when hovered over the persona.

When the user creates a note, the user will be assinged as the note's author. To achieve this, we are passing in `authorInfo` as props to [Header.tsx](./src/view/Header.tsx), where the button action for a adding note in defined.

```ts
const onAddNote = () => {
    const { scrollHeight, scrollWidth } = document.getElementById("NoteSpace")!;
    const id = uuidv4();
    const newCardData: NoteData = {
    id,
    position: {
        x: Math.floor(Math.random() * (scrollWidth - NOTE_SIZE.width)),
        y: Math.floor(Math.random() * (scrollHeight - NOTE_SIZE.height)),
    },
    lastEdited: { member: props.author, time: Date.now() },
    author: props.author,
    numLikesCalculated: 0,
    didILikeThisCalculated: false,
    color
    };
    props.model.SetNote(id, newCardData);
};
```

Here you can see that the `authorInfo` that's passed in is set as the value for the `author` property of `NoteData` before the object is passed into the `SetNote()` function from [BrainstormModel](./src/BrainstormModel.ts) to add in the new entries. The new entries will be added to `SharedMap`, trigger the "valueChanged" event and causing the listener to fire the `syncLocalAndFluidState()` function defined in the `useEffect()` hook.

Now, with the note author assigned, we can now pass in same `author` property of `NoteData` to the `Note` element in [NoteSpace.tsx](./src/view/NoteSpace.tsx) as props, which is then pased into [NoteHeader.tsx](./src/view/NoteHeader.tsx) as props as well.

```ts
const tooltipAuthorName = props.author.userName === props.currentUser.userName? "you" : props.author.userName;
const items: ICommandBarItemProps[] = [
{
    key: "persona",
    onRender: () => {
    return (
        <TooltipHost
        styles={{ root: { alignSelf: "center", display: "block" } }}
        content={"Created by " + tooltipAuthorName}
        >
...
```
Here we see in [NoteHeader.tsx](./src/view/NoteHeader.tsx), the `tooltipAuthorName` is instantiated based on if the `currentUser` is the author of the note. If so, it will display "Created by you" to be more intuitive.

### 3. Displaying Like and the Note's liked users
    
- Liking a note
    The way liking a note works is a bit different than creating a note. We are now passing `authorInfo` into [NoteSpace.tsx](./src/view/NoteSpace.tsx) as props. This is also where we defined the like button action.

    ```ts
    const onLike = () => {
        model.LikeNote(note.id, props.author);
    };
    ```
    When the user clicks on the like button, the `onLike()` function will be triggered, which calls the `LikeNote()` function defined in [BrainstormModel](./src/BrainstormModel.ts). The `LikeNote()` will then toggle the `SharedMap` value depending on if the user have already liked the note already.

    ```ts
    LikeNote(noteId: string, author: FrsMember) {
      const voteString = c_votePrefix + noteId + "_" + author.userId;
      sharedMap.get(voteString) === author
        ? sharedMap.set(voteString, undefined)
        : sharedMap.set(voteString, author);
    },
    ```

    With the `onLike()` button action defined, we now pass the function as props into `Note.tsx`(./src/view/Note.tsx), which then gets passed into [NoteHeader.tsx](./src/view/NoteHeader.tsx) and used in the `CommandBarButton` element.

    ```ts
    const farItems: ICommandBarItemProps[] = [
    {
      key: "likes",
      onClick: props.onLike,
      text: props.numLikesCalculated.toString(),
      iconProps: {
        iconName: props.didILikeThisCalculated ? "LikeSolid" : "Like",
      },
      buttonStyles: likesButtonStyle,
      commandBarButtonAs: (props) => {
        return (
          <TooltipHost
            tooltipProps={likeBtnTooltipProps}
            directionalHint={DirectionalHint.topAutoEdge}
            styles={tooltipHostStyle}
          >
            <CommandBarButton {...(props as any)} />
          </TooltipHost>
        );
      },
    },
    ...
    ```
- Displaying liked users
    In order to gather all the liked user for a specific note, we defined a `getLikedUsers()` in , which calls `GetNoteLikedUsers()` and works similarly to `onLike()`.
    
    ```ts
    const getLikedUsers = () => {
        return model.GetNoteLikedUsers(note.id);
    };
    ```
    `getLikedUsers` is also passed into `Note.tsx`(./src/view/Note.tsx) and [NoteHeader.tsx](./src/view/NoteHeader.tsx) as props, then the function gets called to render a `ReactionListCallout` of liked users.


    ```ts
    const likeBtnTooltipProps: ITooltipProps = {

    onRenderContent: () => {
      const likedUserList = props.getLikedUsers();

      if (likedUserList.length === 0) {
        // Don't render a tooltip if no users reacted.
        return null;
      }
      return (
        <ReactionListCallout
          label={"Like Reactions"}
          reactionIconName={"Like"}
          usersToDisplay={likedUserList}
        />
      );
    },
    ...
  ```

  Now, back to `GetNoteLikedUsers()` in [BrainstormModel](./src/BrainstormModel.ts). In order to gather all liked users from `SharedMap`, we have to perform a few filtering.

  ```ts
   GetNoteLikedUsers(noteId: string): FrsMember[] {
      return (
        Array.from(sharedMap
          .keys())
          // Filter keys that represent if a note was liked
          .filter((key: string) => key.startsWith(c_votePrefix + noteId))
          .filter((key: string) => sharedMap.get(key) !== undefined)
          // Return the user associated with the like
          .map((value: string) => sharedMap.get(value)!)
      );
    },
  ```
  As shown here, we first take all the keys from `SharedMap` and filter them by the vote prefix to get a list of keys that's only relevant to that note's likes. We then filter again to exclude all the likes that are undefined, leaving us with a list of users that have liked the note.

### 4. Displaying The Note's Last Edited User
Now let's focus on a more complex use case of `authorInfo`, editing a note and displaying the note's last edited user. When displaying the last edited user for the note, we are taking into account of the current user and the last edited user. If the last edited user is the same as the current user, instead of displaying the user's name, we display "Last edited by you" to be more intuitive. It is also important to define that only when the user alters the content/text inside the body of a note is considered editing. In other words, only when `setNoteText()` in [BrainstormModel](./src/BrainstormModel.ts) is called will we update the note's last edited user.

```ts
const setText = (text: string) => {
    model.SetNoteText(note.id, text, props.author);
};
```

As seen in here in [NoteSpace.tsx](./src/view/NoteSpace.tsx), the `setText()` function calls the `SetNoteText()` function from [BrainstormModel](./src/BrainstormModel.ts), passing in `props.author`, which we got by passing in `authorInfo` as props to the `NoteSpace` element, as argument. Similar to `onLike()` mentioned previously, the `setText()` function defined here is passed into [NoteBody.tsx](./src/view/NoteBody.tsx) as props where it will be called when the text changes.

```ts
return (
    <div style={{ flex: 1 }}>
      <TextField
        styles={{ fieldGroup: { background: ColorOptions[color].light } }}
        borderless
        multiline
        resizable={false}
        autoAdjustHeight
        onChange={(event) => setText(event.currentTarget.value)}
        value={text}
        placeholder={"Enter Text Here"}
      />
    </div>
  );
```

Going back to `SetNoteText()` from [BrainstormModel](./src/BrainstormModel.ts), we can see in the definition below that we are not only updating the last edited member but also giving it a timestamp of when it was last edited.

```ts
const SetNoteText = (noteId: string, noteText: string, lastEditedMember: FrsMember) => {
    sharedMap.set(c_TextPrefix + noteId, noteText);
    sharedMap.set(c_LastEditedPrefix + noteId, { member: lastEditedMember, time: Date.now() });
  };
```
The reason for adding a timestamp is because given that Fluid updates so quickly, in the event where multiple users are editing the same note, we want to wait a little bit after all changes are done before displaying the last edited user. By doing this, we can prevent the "last edited user" feature to flicker with user names, which could potentially be distracting.

Now, to display the last edited user, we are passing in the `lastEdited` object literal and the `currentUser` into [Note.tsx](./src/view/Note.tsx) as props, which is also passed into [NoteFooter.tsx](./src/view/NoteFooter.tsx) as props.

```ts
let lastEditedMemberName;

// To prevent flickering, wait for 2s to ensure no one else is editing the note
if((Date.now() - lastEdited.time) >= 2000) {
    lastEditedMemberName = currentUser?.userName === lastEdited.member.userName? "you" : lastEdited.member.userName;
  }
else {
    lastEditedMemberName = "...";
}

return (
    <div style={{ flex: 1 }}>
      <TextField
        styles={{ fieldGroup: { background: ColorOptions[color].light}, field: { color: "grey"}}}
        borderless
        readOnly={true}
        resizable={false}
        autoAdjustHeight
        value={"Last edited by " + lastEditedMemberName}
      />
    </div>
  );
```

Here we see that `lastEditedMemberName` is instantiated depending on if the last edited user is the same as the current user and if the last change in content is 2 seconds or more ago, before finally displaying the output.

One final caveat to this feature is that we are using the `useEffect()` hook to update our views, but with our implementation, the hook will only be triggered when a user makes a change to the `SharedMap`. Hence, to update the last edited user for the note after 2 seconds has passed, we added a timer to trigger a `useEffect()` hook in [NoteSpace.tsx](./src/view/NoteSpace.tsx) every 3 seconds and refresh the view.

```ts
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

    // Timer to refresh so as to update the "last edited" feature when there is no edit
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 3000);

    syncLocalAndFluidState();
    model.setChangeListener(syncLocalAndFluidState);
    
    return () => {
      model.removeChangeListener(syncLocalAndFluidState);
      clearInterval(timer);
    }
  }, [model, props.author]);
```




