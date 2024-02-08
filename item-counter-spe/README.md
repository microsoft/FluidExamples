# Shared Tree Demo

This app demonstrates how to create a simple tree data structure and build a React app using that data.

## Setting up the Fluid Framework

This app is designed to use SharePoint Embedded.

[Write more about SPE and how to set it up here]

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
