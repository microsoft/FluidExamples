# @fluid-example/brainstorm

Brainstorm is an example of integrating Fluid into an existing website as an application. It let's users create new brainstorms and share notes.

## Getting Started

To run this follow the steps below:

1. Run `npm install` from the sudoku root
2. Run `npm run start:server` to start a Tinylicious Fluid Server
3. Run `npm run start` (from a different command window) to start the collaborative example

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

Uses `webpack-dev-server` to start a local webserver that will host your webpack file.

Once you run `start` you can navigate to `http://localhost:8080` in any browser window to use your fluid example.

> The Tinylicious Fluid server must be running. See [`start:server`](###-start:server) below.

### `start:all`

```bash
npm run start:all
```

Runs both `start` and `start:server`.

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
