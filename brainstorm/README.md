# @fluid-example/brainstorm

Brainstorm is an example of using the Fluid Framework to build a collaborative line of business application. In this example
each user can create their own sticky notes that is managed on a board.

## Getting Started

To run this follow the steps below:

1. Run `npm install` from the brainstorm folder root
2. Run `npm run start` to start both the client and server
3. Navigate to `http://localhost:8080` in a browser tab

## Data model

Brainstorm uses the following distributed data structures:

- SharedDirectory - root
- SharedMap - storing note information
- SharedMap - storing vote information
- SharedMap - storing user information

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

Once you run [`start:test`](###-start:test) you can navigate to `http://localhost:8080` in any browser window to test your fluid example.

[`start:test`](###-start:test) uses a Fluid server with storage to local tab session storage and launches two instances side by side. It does not require Tinylicious.

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

Runs [`npm run test`](###-test) with additional properties that will report success/failure to a file in `./nyc/*`. This is used for CI validation.

### `tsc`

Compiles the TypeScript code. Output is written to the `./dist` folder.

### `webpack`

Compiles and webpacks the TypeScript code. Output is written to the `./dist` folder.
