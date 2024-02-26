# Shared Tree Demo

This app demonstrates how to create a simple tree data structure and build a React app using that data.

## Setting up the Fluid Framework

This app is designed to use SharePoint Embedded (SPE). The core application code is the same as samples that use Azure Fluid Relay (AFR); however,
this sample uses odsp-client to connect to Fluid Framework as opposed to azure-client. The differences are primarilly isolated to the
infra folder, although the initialization flow for this app is different in that it includes auth while the AFR samples are anonymous.

To use SPE you need to create an M365 developer account and configure SharePoint Embedded. The easiest way to get started is to install the SharePoint Embedded Visual Studio Code extension. From there you can create a new M365 developer tenant, create a new client app (with the require Microsoft Entra client ID) create new File Storage Container Types, and create new File Storage Containers.

This sample app requires that you have a Microsoft Entra client Id, have created a File Storage Container Type, and that the tenant you plan to use has a File Storage Container with that File Storage Container Type ID. Once you have done that, create a .env file in the item-counter-spe folder with the following content:

```
SPE_CLIENT_ID='your client id'
SPE_CONTAINER_TYPE_ID='your container type id'
```

With that in place, you can run this sample (`npm run dev`). Log in with the admin credentials for the tenant.

## Schema Definition

The SharedTree schema is defined in the schema.ts source file. This schema is passed into the SharedTree when it is initialized in index.tsx. For more details, see the schema.ts comments.

## Working with Data

Working with data in the SharedTree is very simple; however, working with distributed data is always a little more complicated than working with local data. One important note about managing local state and events: ideally, in any app you write, it is best to not special case local changes. Treat the SharedTree as your local data and rely on tree events to update your view. This makes the code reliable and easy to maintain. Also, never mutate tree nodes within events listeners.

## User Interface

This app is built using React. If you want to change the css you must run 'npx tailwindcss -i ./src/index.css -o ./src/output.css --watch' in the root folder of your project so that tailwind can update the output.css file.

## Building and Running

You can use the following npm scripts (`npm run SCRIPT-NAME`) to build and run the app.

<!-- AUTO-GENERATED-CONTENT:START (SCRIPTS) -->

| Script    | Description                                       |
| --------- | ------------------------------------------------- |
| `build`   | `npm run format && npm run webpack`               |
| `compile` | Compile the TypeScript source code to JavaScript. |
| `dev`     | Runs the app.                                     |
| `docs`    | Update documentation.                             |
| `format`  | Format source code using Prettier.                |
| `lint`    | Lint source code using ESLint                     |
| `webpack` | `webpack`                                         |
| `start`   | `npm run dev`                                     |

<!-- AUTO-GENERATED-CONTENT:END -->
