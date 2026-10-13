# Canvas tests

The Playwright configuration starts the local Azure Fluid service on port 7070 and the Vite frontend in local mode on port 8080. No cloud credentials are required.

```sh
npm ci
npx playwright install chromium
npx playwright test
```

Use `npx playwright test test/schema.test.ts` for table/undo regressions or `npx playwright test test/collaboration.test.ts` for multi-client behavior.

- `App.test.ts` and `canvas.test.ts`: startup, shapes, notes, tables, deletion, and duplication.
- `schema.test.ts`: current table APIs, row/column moves, single-column deletion, object-cell duplication, and undo/redo.
- `collaboration.test.ts`: bidirectional edits, reload persistence, selection/cursor disconnect cleanup, live ink, and drag overlays.
- `table.test.ts`: collaborative cell types and virtualized rendering of large tables.
- `comments.test.ts`: independent guest voting and shared item comments.

Collaboration tests use separate browser contexts and the same attached document URL. They wait for observable state instead of fixed delays and report browser exceptions. Startup failures do not become skipped tests.

The local service's storage is temporary. Azure authentication, production token authorization, and migrating old experimental Canvas documents are outside this suite.
