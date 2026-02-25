/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Page } from "@playwright/test";

/**
 * Test Utilities and Helpers for Fluid Framework Demo
 *
 * Updated to match the actual app structure and selectors
 */

export const TEST_IDS = {
	// Main app structure (based on actual DOM structure)
	APP_MAIN: "#main",
	APP_CANVAS: "#canvas",

	// Items (use actual data attributes from the app)
	ITEM_SELECTOR: "[data-item-id]",
	SVG_ITEM_SELECTOR: "[data-svg-item-id]",
	SHAPE_CIRCLE: '[data-item-id*="circle"], [data-svg-item-id*="circle"]',
	SHAPE_SQUARE: '[data-item-id*="square"], [data-svg-item-id*="square"]',
	SHAPE_TRIANGLE: '[data-item-id*="triangle"], [data-svg-item-id*="triangle"]',
	SHAPE_STAR: '[data-item-id*="star"], [data-svg-item-id*="star"]',
	NOTE: '[data-item-id*="note"]',
	TABLE: '[data-item-id*="table"]',

	// UI Elements (will need to be verified)
	COMMENTS_PANE: '[data-testid="comments-pane"]',
	VOTE_BUTTON: '[data-testid="vote-button"]',
	COMMENT_INPUT: '[data-testid="comment-input"]',

	// Toolbar and buttons
	TOOLBAR: '[data-testid="toolbar"]',
	UNDO_BUTTON: '[data-testid="undo-button"]',
	REDO_BUTTON: '[data-testid="redo-button"]',
	CLEAR_BUTTON: '[data-testid="clear-button"]',
} as const;

export const BUTTON_NAMES = {
	// Creation buttons (using accessible aria-label text)
	CIRCLE: /Add a circle shape/i,
	SQUARE: /Add a square shape/i,
	TRIANGLE: /Add a triangle shape/i,
	STAR: /Add a star shape/i,
	NOTE: /Add a sticky note/i,
	TABLE: /Add a data table/i,

	// Action buttons
	DELETE: /Delete item/i,
	DUPLICATE: /Duplicate item/i,
	UNDO: /Undo/i,
	REDO: /Redo/i,
	CLEAR: /Remove all items/i,
	COMMENTS: /Show Comments|Hide Comments/i,
	VOTE: /Vote/i,

	// Table operations
	ADD_ROW: /add.*row|insert.*row/i,
	DELETE_ROW: /delete.*row/i,
	ADD_COLUMN: /add.*column|insert.*column/i,
	DELETE_COLUMN: /delete.*column/i,

	// Ink and drawing
	INK: /ink/i,
	ERASER: /eraser/i,
} as const;

// Helper functions for common test operations
export class TestHelpers {
	constructor(private page: Page) {}

	/**
	 * Wait for the app to be fully loaded (local mode - no auth required)
	 */
	async waitForAppReady(): Promise<boolean> {
		try {
			// Wait for the canvas to be visible
			await this.page
				.locator(TEST_IDS.APP_CANVAS)
				.waitFor({ state: "visible", timeout: 10000 });

			// Wait for connected status which indicates Fluid container is ready
			await this.page.getByText("connected").waitFor({ state: "visible", timeout: 15000 });

			// Wait for creation buttons to be enabled (indicates container is fully ready)
			await this.page.getByRole("button", { name: BUTTON_NAMES.NOTE }).waitFor({
				state: "visible",
				timeout: 15000,
			});

			return true;
		} catch (error) {
			console.log("App failed to load:", error);
			return false;
		}
	}

	/**
	 * Create a shape of the specified type
	 */
	async createShape(type: "circle" | "square" | "triangle" | "star"): Promise<void> {
		const buttonName = BUTTON_NAMES[type.toUpperCase() as keyof typeof BUTTON_NAMES];
		await this.page.getByRole("button", { name: buttonName }).click();

		// Wait for the shape to appear
		const selector = TEST_IDS[`SHAPE_${type.toUpperCase()}` as keyof typeof TEST_IDS];
		await this.page.locator(selector).first().waitFor({ state: "visible", timeout: 3000 });
	}

	/**
	 * Create a note
	 */
	async createNote(): Promise<void> {
		await this.page.getByRole("button", { name: BUTTON_NAMES.NOTE }).click();
		await this.page.locator(TEST_IDS.NOTE).first().waitFor({ state: "visible", timeout: 3000 });
	}

	/**
	 * Create a table
	 */
	async createTable(): Promise<void> {
		await this.page.getByRole("button", { name: BUTTON_NAMES.TABLE }).click();
		await this.page
			.locator(TEST_IDS.TABLE)
			.first()
			.waitFor({ state: "visible", timeout: 3000 });
	}

	/**
	 * Select an item by clicking on it
	 */
	async selectItem(selector: string): Promise<void> {
		await this.page.locator(selector).first().click();
	}

	/**
	 * Delete selected items
	 */
	async deleteSelected(): Promise<void> {
		await this.page.getByRole("button", { name: BUTTON_NAMES.DELETE }).click();
	}

	/**
	 * Get count of items matching selector
	 */
	async getItemCount(selector: string): Promise<number> {
		return await this.page.locator(selector).count();
	}

	/**
	 * Click at specific coordinates on the canvas
	 */
	async clickCanvas(x: number, y: number): Promise<void> {
		await this.page.locator(TEST_IDS.APP_CANVAS).click({ position: { x, y } });
	}

	/**
	 * Get all selected items
	 */
	async getSelectedItems(): Promise<string[]> {
		// This would need to be implemented based on how selection state is shown in the UI
		// For now, return empty array
		return [];
	}

	/**
	 * Check if authentication is required
	 */
	async isAuthRequired(): Promise<boolean> {
		const url = this.page.url();
		return (
			url.includes("login.microsoftonline.com") ||
			url.includes("oauth") ||
			url.includes("auth")
		);
	}
}

// Types for better type safety
export type ShapeType = "circle" | "square" | "triangle" | "star";
export type ItemType = ShapeType | "note" | "table";

// Test data constants
export const TEST_DATA = {
	SAMPLE_NOTE_TEXT: "Test note content",
	SAMPLE_COMMENT: "This is a test comment",
	CANVAS_CLICK_POSITIONS: {
		CENTER: { x: 400, y: 300 },
		TOP_LEFT: { x: 100, y: 100 },
		BOTTOM_RIGHT: { x: 700, y: 500 },
	},
} as const;

// Auth detection helper
export async function detectAuthRequired(page: Page): Promise<boolean> {
	try {
		// Check if we're redirected to auth
		const url = page.url();
		if (url.includes("login.microsoftonline.com") || url.includes("oauth")) {
			return true;
		}

		// Check if canvas is available within reasonable time
		await page.locator("#canvas").waitFor({ state: "visible", timeout: 3000 });
		return false;
	} catch {
		return true;
	}
}

// Setup helper for consistent test configuration
export async function setupTest(
	page: Page
): Promise<{ helpers: TestHelpers; authRequired: boolean }> {
	const helpers = new TestHelpers(page);

	await page.goto("/", { waitUntil: "domcontentloaded" });
	const authRequired = await detectAuthRequired(page);

	if (!authRequired) {
		await helpers.waitForAppReady();
	}

	return { helpers, authRequired };
}
