# How to Run Tests with Local Fluid Service (No Authentication Required)

## ✅ Success! Local Mode Setup Complete

The Fluid Framework demo now supports **local development mode** with **no authentication required** for testing.

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests (One Command)

```bash
npm test
```

That's it! The Playwright configuration automatically:

- Starts the local Fluid service on port 7070
- Starts the app in local mode on port 8080
- Runs all tests
- Shuts down services when done

## What Changed

### ✅ Local Mode Implementation

- **Added** `src/start/local_start.ts` - No-auth startup for local development
- **Updated** `src/index.tsx` - Switch between local and Azure modes based on `FLUID_CLIENT` env var
- **Updated** `playwright.config.ts` - Use `npm run dev:local` for testing
- **Updated** tests - Wait for buttons to be enabled (container initialization)

### ✅ Environment Modes

- **Azure Mode** (default): `npm run dev` - Requires Azure authentication
- **Local Mode** (testing): `npm run dev:local` - No authentication required

### ✅ Test Configuration

- **Playwright automatically starts**:
    - Local Fluid service (`npm run start:server`)
    - Frontend in local mode (`npm run dev:local`)
- **Tests wait for container readiness** - Buttons enabled = container ready
- **All original tests preserved** - Just updated selectors and timing

## Manual Testing

### Start Local Development

```bash
# Terminal 1: Start Fluid service
npm run start:server

# Terminal 2: Start app in local mode
npm run dev:local

# Visit: http://localhost:8080
```

### Run Specific Test Files

```bash
# Run just the basic smoke tests
npm test -- test/App.test.ts

# Run canvas operations tests
npm test -- test/canvas.test.ts

# Run with visible browser (debugging)
npm test -- test/App.test.ts --headed
```

## How It Works

### Local Mode vs Azure Mode

| Feature        | Local Mode             | Azure Mode             |
| -------------- | ---------------------- | ---------------------- |
| Authentication | ❌ None required       | ✅ Azure AD required   |
| User Identity  | Mock "Local Developer" | Real Azure account     |
| Fluid Service  | Local tinylicious      | Azure Fluid Relay      |
| Collaboration  | ✅ Works locally       | ✅ Works globally      |
| Tests          | ✅ Perfect for testing | ❌ Requires auth setup |

### Mock User (Local Mode)

```typescript
const localUser = {
	name: "Local Developer",
	id: "local-dev-user",
	image: "https://api.dicebear.com/7.x/avataaars/svg?seed=local-dev-user",
};
```

### Real Collaboration

Even in local mode, you can:

1. Open multiple browser tabs with the same URL
2. See real-time collaboration between tabs
3. Share the URL with others running local mode

## Troubleshooting

### Port Already in Use

If you see "Port 7070 is occupied":

```bash
# Kill any existing services
taskkill /f /im node.exe

# Or use different terminal sessions
```

### Tests Still Failing

1. **Check services are running**:

    ```bash
    # Should show local Fluid service
    curl http://localhost:7070

    # Should show the app
    curl http://localhost:8080
    ```

2. **Check browser console** (if running --headed):
    - Look for "🚀 Starting Fluid Framework Demo in LOCAL mode"
    - Look for "✅ Local Fluid Framework Demo is ready!"

3. **Manual verification**:
    ```bash
    npm run dev:local
    # Visit http://localhost:8080
    # Try creating shapes/notes manually
    ```

## Next Steps

### All Tests Ready

The following test files are now ready to run with no authentication:

- ✅ `App.test.ts` - Basic smoke tests
- ✅ `canvas.test.ts` - Shape/note/table creation
- ✅ `table.test.ts` - Table operations
- ✅ `comments.test.ts` - Comments and voting
- ✅ `collaboration.test.ts` - Multi-user scenarios
- ✅ `canvas-interactions.test.ts` - Pan/zoom/inking
- ✅ `app-flow.test.ts` - App flow and accessibility

### Running Full Test Suite

```bash
# Run all tests
npm test

# Run with UI for debugging
npx playwright test --ui

# Run specific categories
npm test -- test/canvas.test.ts test/table.test.ts
```

### Switching Back to Azure Mode

For production development with real Azure authentication:

```bash
# Use Azure mode (requires .env setup)
npm run dev:azure

# Set up .env file with:
# AZURE_TENANT_ID=your-tenant-id
# AZURE_CLIENT_ID=your-client-id
# etc.
```

## 🎉 Result

**You now have a fully working test suite that:**

- ✅ Requires **no authentication setup**
- ✅ Tests **actual app functionality**
- ✅ Supports **real collaboration** (locally)
- ✅ Runs **all original comprehensive tests**
- ✅ Uses **proper Fluid Framework** (not mocked)
- ✅ **Automatic service management** via Playwright

Run `npm test` and enjoy your working test suite! 🚀
