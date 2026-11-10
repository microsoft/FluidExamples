# Test Suite for Fluid Framework Demo

⚠️ **Current Status**: Tests require Azure authentication to run. Tests will automatically skip with a clear message when authentication is needed. See [Authentication Setup](#running-tests) below.

This directory contains comprehensive end-to-end tests for the Fluid Framework collaborative canvas and table demo application.

## Test Structure

### Test Files

- **`App.test.ts`** - Basic smoke tests and application loading
- **`canvas.test.ts`** - Canvas operations (shape creation, selection, manipulation)
- **`table.test.ts`** - Table functionality (rows, columns, cell editing)
- **`comments.test.ts`** - Comments and voting system
- **`collaboration.test.ts`** - Multi-user collaboration scenarios
- **`canvas-interactions.test.ts`** - Canvas interactions (pan, zoom, inking, drag & drop)
- **`app-flow.test.ts`** - Application flow, performance, accessibility, and responsiveness
- **`test-utils.ts`** - Shared utilities and test helpers

### Test Categories

#### 🎨 **Canvas Operations**

- Shape creation (circle, square, triangle, star)
- Note creation and editing
- Table creation and management
- Item selection and deletion
- Undo/redo functionality
- Clear all operations

#### 📊 **Table Functionality**

- Row operations (add, delete, move up/down)
- Column operations (add, delete, move left/right)
- Column type changes
- Cell editing and navigation
- Table selection states

#### 💬 **Comments & Voting**

- Comments pane toggle
- Adding comments to items
- Comment voting system
- Comment threading/replies
- Author information display

#### 🤝 **Collaboration Features**

- Multi-user scenarios
- Presence indicators
- Real-time synchronization
- User avatars and identity
- Selection synchronization
- Z-order operations

#### 🖱️ **Canvas Interactions**

- Pan and zoom functionality
- Inking and drawing
- Eraser mode
- Shape manipulation (resize, rotate, move)
- Keyboard shortcuts
- Context menus

#### 🚀 **Application Flow**

- App loading and initialization
- URL-based collaboration
- Error handling
- Performance with large datasets
- Accessibility features
- Responsive design
- Data persistence

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run pretest
```

### Authentication Setup (Required)

To run the full test suite, you need to configure Azure authentication. Create a `.env` file in the project root:

```bash
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_REDIRECT_URI=http://localhost:8080
AZURE_ORDERER=your-orderer-url
AZURE_FUNCTION_TOKEN_PROVIDER_URL=your-token-provider-url
```

**Note**: Without proper authentication setup, tests will automatically skip with a clear message.

### Running All Tests

```bash
npm test
```

### Running Specific Test Files

```bash
# Canvas operations only
npx playwright test canvas.test.ts

# Table functionality only
npx playwright test table.test.ts

# Collaboration scenarios only
npx playwright test collaboration.test.ts
```

### Running Tests in Different Modes

```bash
# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests with specific browser
npx playwright test --project=chromium
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:

- **Automatic server startup**: Local Fluid service and frontend dev server
- **Parallel execution**: Tests run in parallel for faster execution
- **Retry policy**: No retries by default (set to 0)
- **Screenshots**: Captured on test failures
- **Trace collection**: Available for debugging failures

### Environment Setup

Tests automatically start the required services:

1. **Azure Local Service** (`npm run start:server`) - Fluid Framework backend
2. **Frontend Dev Server** (`npm run start`) - React application

## Test Patterns

### Element Selection Strategy

Tests use a combination of strategies to find elements:

1. **Test IDs**: `[data-testid="..."]` for reliable element identification
2. **Role-based selectors**: `getByRole("button", { name: /pattern/i })` for accessibility
3. **Semantic selectors**: Leveraging ARIA labels and semantic HTML

### Collaboration Testing

Multi-user scenarios use separate browser contexts:

```typescript
const context1 = await browser.newContext();
const context2 = await browser.newContext();
const page1 = await context1.newPage();
const page2 = await context2.newPage();
```

### Error Handling

Tests include error scenarios:

- Network interruptions
- Rapid user interactions
- Large dataset handling
- Browser navigation edge cases

## Test Data Requirements

The application needs to implement these `data-testid` attributes for reliable testing:

### Canvas Elements

- `data-testid="app-canvas"` - Main canvas container
- `data-testid="shape-circle-{id}"` - Circle shapes
- `data-testid="shape-square-{id}"` - Square shapes
- `data-testid="shape-triangle-{id}"` - Triangle shapes
- `data-testid="shape-star-{id}"` - Star shapes
- `data-testid="note-{id}"` - Note items
- `data-testid="table-{id}"` - Table items

### Table Elements

- `data-testid="table-row-{id}"` - Table rows
- `data-testid="table-header-{id}"` - Table headers
- `data-testid="table-cell-{id}"` - Table cells
- `data-testid="note-text-{id}"` - Note text areas

### Collaboration Elements

- `data-testid="selection-overlay"` - Selection indicators
- `data-testid="presence-{userId}"` - Presence indicators
- `data-testid="user-badge-{userId}"` - User badges
- `data-testid="comments-pane"` - Comments panel

## Maintenance Notes

### Adding New Tests

1. **Follow the existing patterns** in test files
2. **Use the test utilities** from `test-utils.ts`
3. **Add appropriate `data-testid` attributes** to new UI elements
4. **Group related tests** using `test.describe()` blocks

### Updating Selectors

When UI changes require selector updates:

1. Update the constants in `test-utils.ts`
2. Ensure all test files use the centralized selectors
3. Test the changes across all affected test files

### Performance Considerations

- Tests timeout after 30 seconds by default
- Use `waitFor()` for dynamic content instead of fixed delays
- Minimize test data creation to essential scenarios
- Clean up test data between tests when necessary

## Debugging Failed Tests

### Common Issues

1. **Element not found**: Check if `data-testid` attributes are present
2. **Timing issues**: Add appropriate `waitFor()` statements
3. **Collaboration failures**: Ensure both browser contexts are properly set up
4. **Flaky tests**: Add more specific wait conditions

### Debug Tools

```bash
# Run single test in debug mode
npx playwright test canvas.test.ts --debug

# Generate test trace
npx playwright test --trace on

# View test report
npx playwright show-report
```

## Contributing

When adding new features to the application:

1. **Add corresponding tests** to verify functionality
2. **Include collaboration scenarios** for shared features
3. **Test accessibility** aspects with keyboard navigation
4. **Verify performance** with larger datasets
5. **Update this documentation** with any new test patterns
