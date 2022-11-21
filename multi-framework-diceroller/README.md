# @fluid-example/multi-framework-diceroller

This repository contains a simple app that enables all connected clients to roll a dice and view the result, and demonstrates how that dice can be rendered in multiple UI frameworks.

## Requirements

Node 12.17+

## Getting started

## Using this repo

### Run the app locally

To run our local server, Tinylicious, on the default URL of `localhost:7070`, enter the following into a terminal window:

```
npm run start:server
```

With the local service running in the background, we need to connect the application to it. Run the following commands in a new terminal window to start the app. Navigate to `localhost:3000` in the browser to view the app.

```bash
npm i
npm start
```

## Changing view frameworks

This repo demonstrates rendering the dice roller using JavaScript, Web Components, React and Vue. The default view is JavaScipt. To switch to another view framework, change the `diceRoller` import in `src/app.js` line 8 as follows.

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
