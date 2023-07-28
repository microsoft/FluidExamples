# @fluid-example/multi-framework-diceroller

This repository contains a simple app that enables all connected clients to roll a dice and view the result, and demonstrates how that dice can be rendered in multiple UI frameworks.

## Getting started

To run an Azure Client service locally, on the default values of `localhost:7070`, enter the following into a terminal window:

```bash
npx tinylicious
```

With the local service running in the background, we need to connect the application to it.
Run the following commands in a new terminal window to start the app.

```bash
npm install
npm start
```

Navigate to `localhost:8080` in the browser to view the app.

## Changing view frameworks

This repo demonstrates rendering the dice roller using JavaScript, Web Components, React and Vue.
The default view is JavaScipt.
To switch to another view framework, change the `diceRoller` import in `src/app.js` line 8 as follows.

```js
// Default JS view
import { jsDiceRoller as diceRoller } from "./view";

// Web Component view
import { wcDiceRoller as diceRoller } from "./view";

// React view
import { reactDiceRoller as diceRoller } from "./view";

// Vue view
import { vueDiceRoller as diceRoller } from "./view";
```
