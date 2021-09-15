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

This repo demonstrates rendering the dice roller using JavaScript, Web Components, React and Vue. The default view is JavaScipt, and to switch to another view framework, change the `renderDiceRoller` import in `src/app.js` line 8 as follows.

```js
// Default JS view
import { jsRenderView as renderDiceRoller } from "./view";

// Web Component view
import { wcRenderView as renderDiceRoller } from "./view";

// React view
import { reactRenderView as renderDiceRoller } from "./view";

// Vue view
import { vueRenderView as renderDiceRoller } from "./view";

```