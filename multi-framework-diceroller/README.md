# @fluid-example/multi-framework-diceroller

This repository contains a simple app that enables all connected clients to roll a dice and view the result, and demonstrates how that dice can be rendered in multiple UI frameworks.
## Requirements

Node 12.17+

## Getting started

```bash
npm install
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