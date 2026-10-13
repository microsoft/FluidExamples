import { test as base, expect, type Page } from "@playwright/test";

export async function waitForAppReady(page: Page) {
	await expect(page.locator("#canvas")).toBeVisible();
	await expect(page).toHaveURL(/[?&]id=[^&]+/);
	await expect(page.getByText("connected", { exact: true })).toBeVisible();
	await expect(page.getByText("saved", { exact: true })).toBeVisible();
}

export const test = base.extend<{ peer: Page }>({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		try {
			await page.goto("/");
			await waitForAppReady(page);
			await use(page);
		} finally {
			expect(errors, "Unexpected browser exceptions").toEqual([]);
		}
	},
	peer: async ({ browser, page }, use) => {
		const context = await browser.newContext();
		const peer = await context.newPage();
		const errors: string[] = [];
		peer.on("pageerror", (error) => errors.push(error.message));
		try {
			await peer.goto(page.url());
			await waitForAppReady(peer);
			await use(peer);
		} finally {
			await context.close();
			expect(errors, "Unexpected collaborator exceptions").toEqual([]);
		}
	},
});

export { expect };
