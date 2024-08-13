import { defineConfig, devices } from "@playwright/test";

const devServerPort = 8080;
const devServerUrl = `http://localhost:${devServerPort}`;

export default defineConfig({
	// Look for test files in the "tests" directory, relative to this configuration file.
	testDir: "test",

	// Run all tests in parallel.
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code.
	forbidOnly: !!process.env.CI,

	// Retry on CI only.
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI.
	workers: process.env.CI ? 1 : undefined,

	// Reporter to use
	reporter: "junit",

	use: {
		// Base URL to use in actions like `await page.goto('/')`.
		baseURL: devServerUrl,

		// Collect trace when retrying the failed test.
		trace: "on-first-retry",

		// Generate screenshots
		screenshot: "on",
	},
	// Configure projects for major browsers.
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	// Run your local dev server before starting the tests.
	webServer: {
		command: "npm run start",
		url: devServerUrl,
		reuseExistingServer: !process.env.CI,
	},
});
