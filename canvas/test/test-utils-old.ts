/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Page, Browser } from "@playwright/test";

/**
 * Test Utilities and Helpers
 * 
 * This module provides utility functions and constants for Playwright tests.
 * It helps maintain consistent test selectors and common testing patterns.
 */

export const TEST_IDS = {
	// Main application
	APP_CANVAS: '[data-testid="app-canvas"]',
	TOOLBAR: '[role="toolbar"], [data-testid*="toolbar"]',
	
	// Canvas items
	SHAPE_CIRCLE: '[data-testid*="shape-circle"]',
	SHAPE_SQUARE: '[data-testid*="shape-square"]',
	SHAPE_TRIANGLE: '[data-testid*="shape-triangle"]',
	SHAPE_STAR: '[data-testid*="shape-star"]',
	NOTE: '[data-testid*="note-"]',
	TABLE: '[data-testid*="table-"]',
	
	// Table elements
	TABLE_ROW: '[data-testid*="table-row"]',
	TABLE_HEADER: '[data-testid*="table-header"]',
	TABLE_CELL: '[data-testid*="table-cell"]',
	
	// Note elements
	NOTE_TEXT: 'textarea[data-testid*="note-text"]',
	
	// Selection and presence
	SELECTION_OVERLAY: '[data-testid="selection-overlay"]',
	PRESENCE_OVERLAY: '[data-testid*="presence"]',
	USER_BADGE: '[data-testid*="user-badge"]',
	USER_AVATAR: '[data-testid*="user-avatar"], [data-testid*="avatar"]',
	SELECTION_COUNT: '[data-testid*="selection-count"]',
	
	// Comments
	COMMENTS_PANE: '[data-testid="comments-pane"]',
	COMMENT: '[data-testid*="comment"]',
	COMMENT_INDICATOR: '[data-testid*="comment-indicator"]',
	COMMENT_AUTHOR: '[data-testid*="comment-author"]',
	
	// Inking
	INK: '[data-testid*="ink"], svg polyline, svg path',
	
	// Generic selectors
	ANY_SHAPE: '[data-testid*="shape-"]',
	ANY_ITEM: '[data-testid*="shape-"], [data-testid*="note-"], [data-testid*="table-"]',
} as const;

export const BUTTON_NAMES = {
	// Creation buttons
	CIRCLE: /circle/i,
	SQUARE: /square/i,
	TRIANGLE: /triangle/i,
	STAR: /star/i,
	NOTE: /note/i,
	TABLE: /table/i,
	
	// Action buttons
	DELETE: /delete/i,
	DUPLICATE: /duplicate/i,
	UNDO: /undo/i,
	REDO: /redo/i,
	CLEAR_ALL: /clear all/i,
	
	// Table buttons
	ADD_ROW: /add row/i,
	ADD_COLUMN: /add column/i,
	DELETE_ROW: /delete.*row/i,
	DELETE_COLUMN: /delete.*column/i,
	MOVE_ROW_UP: /move.*row.*up/i,
	MOVE_ROW_DOWN: /move.*row.*down/i,
	MOVE_COLUMN_LEFT: /move.*column.*left/i,
	MOVE_COLUMN_RIGHT: /move.*column.*right/i,
	
	// Comment buttons
	COMMENT: /comment/i,
	COMMENT_PANE: /comment.*pane|comments/i,
	
	// Vote buttons
	VOTE: /vote|like|thumb/i,
	
	// Ink buttons
	INK: /ink|pen|draw/i,
	ERASER: /eraser|erase/i,
	INK_COLOR: /ink.*color|color.*picker/i,
	INK_THICKNESS: /thickness|width|size/i,
	
	// Shape buttons
	SHAPE_COLOR: /shape.*color|color/i,
	
	// Z-order buttons
	BRING_TO_FRONT: /bring.*front|to front/i,
	SEND_TO_BACK: /send.*back|to back/i,
	MOVE_FORWARD: /move.*forward/i,
	MOVE_BACKWARD: /move.*backward/i,
	
	// Zoom buttons
	ZOOM_FIT: /zoom.*fit|fit.*content|reset.*zoom/i,
} as const;

/**
 * Common test helper functions
 */
export class TestHelpers {
	/**
	 * Wait for the app to be fully loaded
	 */
	static async waitForAppReady(page: Page) {
		await page.goto("/", { waitUntil: "domcontentloaded" });
		await page.locator(TEST_IDS.APP_CANVAS).waitFor({ state: "visible" });
		// Add a small delay to ensure app is fully initialized
		await page.waitForTimeout(100);
	}
	
	/**
	 * Create a shape of the specified type
	 */
	static async createShape(page: Page, shapeType: 'circle' | 'square' | 'triangle' | 'star') {
		const buttonName = BUTTON_NAMES[shapeType.toUpperCase() as keyof typeof BUTTON_NAMES];
		await page.getByRole("button", { name: buttonName }).click();
		
		const selector = TEST_IDS[`SHAPE_${shapeType.toUpperCase()}` as keyof typeof TEST_IDS];
		await page.locator(selector).first().waitFor({ state: "visible" });
	}
	
	/**
	 * Create a note
	 */
	static async createNote(page: Page) {
		await page.getByRole("button", { name: BUTTON_NAMES.NOTE }).click();
		await page.locator(TEST_IDS.NOTE).first().waitFor({ state: "visible" });
	}
	
	/**
	 * Create a table
	 */
	static async createTable(page: Page) {
		await page.getByRole("button", { name: BUTTON_NAMES.TABLE }).click();
		await page.locator(TEST_IDS.TABLE).first().waitFor({ state: "visible" });
	}
	
	/**
	 * Select an item by clicking on it
	 */
	static async selectItem(page: Page, selector: string) {
		await page.locator(selector).first().click();
		// Wait for selection overlay to appear
		await page.locator(TEST_IDS.SELECTION_OVERLAY).waitFor({ state: "visible" });
	}
	
	/**
	 * Clear all items from canvas
	 */
	static async clearCanvas(page: Page) {
		const clearButton = page.getByRole("button", { name: BUTTON_NAMES.CLEAR_ALL });
		if (await clearButton.isVisible()) {
			await clearButton.click();
		}
	}
	
	/**
	 * Set up a collaboration scenario with two pages
	 */
	static async setupCollaboration(browser: Browser) {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();
		
		const page1 = await context1.newPage();
		const page2 = await context2.newPage();
		
		// User 1 creates the container
		await this.waitForAppReady(page1);
		const collaborationUrl = page1.url();
		
		// User 2 joins the container
		await page2.goto(collaborationUrl, { waitUntil: "domcontentloaded" });
		await page2.locator(TEST_IDS.APP_CANVAS).waitFor({ state: "visible" });
		
		return { page1, page2, context1, context2, collaborationUrl };
	}
}

/**
 * Test data constants
 */
export const TEST_DATA = {
	NOTE_TEXT: "Test note content",
	COMMENT_TEXT: "This is a test comment",
	TABLE_CELL_TEXT: "Test cell content",
} as const;