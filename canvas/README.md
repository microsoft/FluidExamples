# Fluid Canvas

A React and TypeScript canvas combining **SharedTree** for persistent document data with **Presence** for ephemeral collaboration.

## Features

- Shapes, editable sticky notes, and collaborative tables.
- Dragging, rotation, shape resizing, layering, multi-selection, zoom, and pan.
- Freehand ink and erasing, including live remote stroke previews.
- Per-item and general comments, voting, and local undo/redo.
- Remote selections, cursors, collaborator avatars, and disconnect cleanup.
- Virtualized tables with string, number, boolean, date, and vote cells, column sorting, and row/column operations.
- Azure Fluid Relay locally or with Microsoft sign-in and an Azure token service.

## Run locally

Use Node.js **22.22.2 or newer**.

```sh
npm ci
npm run start:server
```

In a second terminal in this folder:

```sh
npm run dev:local
```

Open http://localhost:8080. A new document's URL receives an `id` query parameter after attachment. Open that **same URL** in another browser window to collaborate. Opening the bare URL creates a separate document.

`npm start` also defaults to local mode unless `FLUID_CLIENT=azure` is configured. Local mode requires no Microsoft account; browser instances receive distinct guest identities. The local relay is a development service, not durable production storage.

## Azure Fluid Relay

Configure an Azure Fluid Relay resource, an Entra application with an appropriate SPA redirect URI, and a server-side token endpoint. Copy `.env.example` to an untracked `.env` file, fill in the values, and select Azure mode:

```dotenv
FLUID_CLIENT=azure
AZURE_CLIENT_ID=<Entra application client ID>
AZURE_REDIRECT_URI=http://localhost:8080
AZURE_TENANT_ID=<Azure Fluid Relay tenant ID>
AZURE_ORDERER=<Azure Fluid Relay endpoint>
AZURE_FUNCTION_TOKEN_PROVIDER_URL=<server-side token endpoint URL>
```

Run `npm run dev:azure`. The app uses MSAL for Microsoft sign-in and can obtain a profile picture through Microsoft Graph. The token endpoint must authenticate/authorize callers appropriately and return the Fluid token as a string. **Never put a Fluid tenant secret or other server credentials in the browser environment.** The insecure token provider is used only for the local service.

Build and host the `dist` folder for deployment. Configure the SPA redirect URI for the deployed origin. Azure integration requires your own provisioned services; local browser tests do not exercise Entra or a real Azure token endpoint.

## Fluid 3.5 modernization

This example brings the Canvas feature set onto the repository's current `main` structure and Fluid **3.5.0**, rather than merging the old branch's dependency and pipeline history.

| Previous Canvas API                              | Current usage                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Fluid 2.60, experimental Presence imports        | Fluid 3.5 and public `@fluidframework/presence` APIs                            |
| `getPresence` from the Presence package          | `getPresence` from `fluid-framework`                                            |
| Alpha `TableSchema` / `SchemaFactoryAlpha`       | Beta `TableSchema` / `SchemaFactoryBeta` from `fluid-framework/beta`            |
| `new FluidTable(...)` and row-owned cell methods | `FluidTable.create(...)` and table-level `getCell`, `setCell`, and `removeCell` |
| React 18 and legacy JSX types                    | React 19 and explicitly imported JSX types                                      |
| TypeScript 5.7 / ES6 target                      | TypeScript 6.0 / ES2022, matching Fluid 3.5's supported toolchain               |
| Generated CSS checked into source                | Tailwind processed by Vite from `src/index.css`                                 |

**Document compatibility:** the current beta table implementation has a different persisted schema. This example intentionally creates **new Canvas documents**. It does not migrate old experimental Canvas documents or reinterpret their data. Incompatible schemas produce an error; remove the URL's `id` parameter to create a new document. Keep using the original branch if you need to access an old document.

TableSchema remains a beta API, not a stable API guarantee. The local relay's insecure token provider comes from the test utilities' internal entry point; it is not used for Azure token retrieval. Review these dependencies when upgrading Fluid and keep the Fluid package versions aligned.

The update also removes unused token/authentication code and duplicate selection implementations. Presence-driven overlay updates are coalesced to animation frames without remounting the overlay DOM. Disconnects remove transient indicators; container and React subscriptions are cleaned up. Table moves preserve cells, and duplicating a table deep-copies date/vote nodes rather than reusing attached SharedTree nodes.

Tables have a bounded, scrollable viewport: large documents render only the visible rows plus overscan, rather than expanding the viewport and accidentally rendering every row.

## Structure

| Folder                   | Responsibility                                            |
| ------------------------ | --------------------------------------------------------- |
| `src/schema`             | SharedTree schemas and document operations                |
| `src/presence`           | Selection, user, cursor, drag, resize, and ink state      |
| `src/infra`, `src/start` | Relay configuration, authentication, and document loading |
| `src/react`              | React views, interaction hooks, and overlays              |
| `src/undo`               | Revertible lifecycle and local undo/redo                  |
| `test`                   | Schema regressions and Playwright collaboration tests     |

Persistent edits belong in SharedTree. Pointer movement and in-progress gestures belong in Presence; commit the final edit to SharedTree. React subscribes to both local and remote updates instead of treating remote changes as a separate data model.

## Development

| Command               | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| `npm run compile`     | Strict TypeScript check without emitting files          |
| `npm run build`       | Type-check and build with Vite                          |
| `npm run lint`        | ESLint                                                  |
| `npm run format`      | Format source with Prettier                             |
| `npm run dev:network` | Explicitly expose the dev server to your network        |
| `npm test`            | Playwright tests, starting the local relay and frontend |

For a targeted browser run, install Chromium with `npx playwright install chromium`, then run `npx playwright test test/collaboration.test.ts`.

The table toolbar includes an **Insert 1000 rows** action to exercise virtualization. Add `debug=1` to the URL during development to opt into Eruda mobile debugging.

Tests fail on startup or collaboration errors rather than skipping them as authentication failures. See [test/README.md](test/README.md) for coverage and execution details.
