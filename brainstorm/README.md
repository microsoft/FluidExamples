# Lets Brainstorm

```
This example is using an experimental API surface so please be cautious. We will break it!
```

Brainstorm is an example of using the Fluid Framework to build a collaborative line of business application. In this example each user can create their own sticky notes that is managed on a board.

This application was shown during a [Microsoft Build session](https://aka.ms/OD522).

## Getting Started

To run this follow the steps below:

1. Run `npm install` from the brainstorm folder root
2. Run `npx tinylicious` to start the "Tinylicious" test service
3. Run `npm run start` to start the client
4. Navigate to `http://localhost:3000` in a browser tab

This package is based on the [Create React App](https://reactjs.org/docs/create-a-new-react-app.html), so much of the Create React App documentation applies.

## Using the Brainstorm App

1. Navigate to `http://localhost:3000`

You'll be taken to a url similar to 'http://localhost:3000/**#1621961220840**' the path `##1621961220840` is specifies one brainstorm document.

2. Create another chrome tab with `http://localhost:3000/**#1621961220840**`

Now you can create notes, write text, change colors and more!

## Connecting to the Service
By configuring the `FrsConnectionConfig` that we pass into the `FrsClient` instance, we can connect to both live FRS instance by passing in the tenant ID, orderer and storage as well as using the tenant ID as "local" for running against Tinylicious for development purpose. The `FrsConnectionConfig` is defined by the `connectionConfig` constant in [Config.ts][Config].

[Config]: {{< relref Config.ts >}}


Running `FrsClient` against local Tinylicious instance
: To run against our local Tinylicious instance, we pass the `tenantId` as "local" and make use of `InsecureTokenProvider`. The `InsecureTokenProvider` requires we pass in two values to its constructor: a key string, which can be anything since we are running it locally, and an IUser type object identifying the current user. For running the instance locally, the orderer and storage URLs would point to the Tinylicious instance on the default values of `http://localhost:7070`.

---
**NOTE**

To launch the local Tinylicious service instance, run `npx tinylicious` from your terminal window

---

Running `FrsClient` against live FRS instance
: To run against live FRS Instance, tenant ID, orderer and storage URLs are required. We make use of `FrsAzFunctionTokenProvider` which takes in the Azure function URL and an IUser type object identifying the current user, thereby making an axios `GET` request call to the Azure Function. This axios call takes in the tenant ID, documentId and userID/userName as optional parameters. The Azure Function is responsible for mapping the `tenantId` to tenant key secret to generate and sign the token such that the service will accept it.

To add more versatility, we also incorporated an `useFrs` flag. Depending on the npm command you run (`npm run start` or `npm run start:frs`), the flag will toggle between remote and local mode using the same config format. We make use of `FrsAzFunctionTokenProvider` for running against live FRS instance since it is more secured, without exposing the tenant secret key in the client-side code whereas while running the service locally for development purpose, we make use of `InsecureTokenProvider`.

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

## SharedMap and prefix structure to create new notes, keep track of edits


## using audience to render user info
