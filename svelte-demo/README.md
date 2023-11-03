# @fluid-example/svelte-demo

## About this repo

This Fluid starter template should help get you started developing with Svelte and TypeScript in Vite. This repo makes the following assumptions:

1. You want to use Svelte for your view
1. You want Hot Module Replacement(HMR)
1. You want to keep clear separation between your model and view
1. You want a light state management framework to remove the boilerplate needed to store, access and modify app state
1. You already have Node installed on your local machine. If not, follow the instructions [here](https://nodejs.org/en/download/).

## Overview

In this readme we'll walk you through the following topics:

### Using this repo locally

-   Run the app locally

## Using this repo

### Run the app locally

To run our local server, Tinylicious, on the default values of `localhost:7070`, enter the following into a terminal window:

```bash
npx tinylicious
```

Now, with our local service running in the background, we need to connect the application to it. The app has already been configured to this so now we just need to run the following in a new terminal window to start the app.

```bash
npm i -g pnpm@^7
pnpm i
pnpm run dev
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).
