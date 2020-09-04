# @fluid-example/draft-js

An experimental implementation of how to take Facebook's open source [Draft.js](https://draftjs.org/) rich text editor and
enable real-time coauthoring using the Fluid Framework.

## Getting Started

To run this follow the steps below:

1. Run `npm install` from the draft-js folder root
2. Run `npm run start` to start both the client and server
3. Navigate to `http://localhost:8080` in a browser tab
4. Copy full URL, including hash id, to a new tab for collaboration

## Data model

Draft.js uses the following distributed data structures:

- SharedDirectory - root
- SharedString - storing Draft.js text
- SharedMap - storing user presence

## Available Scripts

### `build`

```bash
npm run build
```

Runs [`tsc`](###-tsc) and [`webpack`](###-webpack) and outputs the results in `./dist`.

### `start`

```bash
npm run start
```

Runs both [`start:client`](###-start:client) and [`start:server`](###-start:server).

### `start:client`

```bash
npm run start:all
```

Uses `webpack-dev-server` to start a local webserver that will host your webpack file.

Once you run `start` you can navigate to `http://localhost:8080` in any browser window to use your fluid example.

> The Tinylicious Fluid server must be running. See [`start:server`](###-start:server) below.

### `start:server`

```bash
npm run start:server
```

Starts an instance of the Tinylicious Fluid server running locally at `http://localhost:3000`.

> Tinylicious only needs to be running once on a machine and can support multiple examples.

### `start:test`

```bash
npm run start:test
```

Uses `webpack-dev-server` to start a local webserver that will host your webpack file.

Once you run `start:test` you can navigate to `http://localhost:8080` in any browser window to test your fluid example.

`start:test` uses a Fluid server with storage to local tab session storage and launches two instances side by side. It does not require Tinylicious.

This is primarily used for testing scenarios.

### `test`

```bash
npm run test
```

Runs end to end test using [Jest](https://jestjs.io/) and [Puppeteer](https://github.com/puppeteer/puppeteer/).

### `test:report`

```bash
npm run test:report
```

Runs `npm run test` with additional properties that will report success/failure to a file in `./nyc/*`. This is used for CI validation.

### `tsc`

Compiles the TypeScript code. Output is written to the `./dist` folder.

### `webpack`

Compiles and webpacks the TypeScript code. Output is written to the `./dist` folder.

## Known Issues

### [Issue #22](https://github.com/microsoft/FluidExamples/issues/22) - Presence stored in the ShareMap

### [Issue #23](https://github.com/microsoft/FluidExamples/issues/23) - No Undo/Redo Support

### [Issue #24](https://github.com/microsoft/FluidExamples/issues/24) - No FluidObject Canvas Support
