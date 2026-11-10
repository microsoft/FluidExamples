/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tree } from "@fluidframework/tree";
import { Items } from "../schema/appSchema.js";
import { getContentHandler } from "./contentHandlers.js";
import { getAllItems } from "./itemsHelpers.js";

/**
 * Centers the last item in the given items array within the viewport.
 *
 * @param items - The Items array to work with
 * @param pan - Current pan position {x, y}
 * @param zoom - Current zoom level (defaults to 1 if not provided)
 * @param canvas - Canvas dimensions {width, height}
 * @param estimatedWidth - Estimated width for items without known size (default: 120)
 * @param estimatedHeight - Estimated height for items without known size (default: 120)
 * @param useGetAllItems - If true, use getAllItems helper to flatten nested items (default: false)
 */
export function centerLastItem(
	items: Items,
	pan: { x: number; y: number } | undefined,
	zoom: number | undefined,
	canvas: { width: number; height: number },
	estimatedWidth = 120,
	estimatedHeight = 120,
	useGetAllItems = false
): void {
	if (!pan) return;

	// Default zoom to 1 if not provided (for keyboard shortcuts context)
	const actualZoom = zoom ?? 1;

	// Get all items, either directly or flattened
	const allItems = useGetAllItems ? getAllItems(items) : Array.from(items);
	if (allItems.length === 0) return;

	const lastItem = allItems[allItems.length - 1];
	if (!lastItem) return;

	// Determine item dimensions
	let itemWidth = estimatedWidth;
	let itemHeight = estimatedHeight;

	// Try to get actual size from content
	try {
		const handler = getContentHandler(lastItem);
		if (handler.type === "shape") {
			itemWidth = itemHeight = handler.getSize();
		}
	} catch {
		// Fallback: try direct size access (for compatibility)
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const content: any = lastItem.content;
			if (content && typeof content.size === "number") {
				itemWidth = itemHeight = content.size;
			}
		} catch {
			// Use estimated dimensions
		}
	}

	// Calculate viewport dimensions and position
	const viewportWidth = canvas.width / actualZoom;
	const viewportHeight = canvas.height / actualZoom;
	const viewportX = -pan.x / actualZoom;
	const viewportY = -pan.y / actualZoom;

	// Calculate center position
	const centerX = viewportX + viewportWidth / 2 - itemWidth / 2;
	const centerY = viewportY + viewportHeight / 2 - itemHeight / 2;

	// Update item position within a transaction
	Tree.runTransaction(items, () => {
		lastItem.x = centerX;
		lastItem.y = centerY;
	});
}
