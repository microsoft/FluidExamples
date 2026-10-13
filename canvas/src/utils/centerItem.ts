/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tree } from "fluid-framework";
import type { Item, Items } from "../schema/appSchema.js";
import { getContentHandler } from "./contentHandlers.js";

export function createCenteredItem(
	items: Items,
	create: () => Item,
	pan: { x: number; y: number } | undefined,
	zoom: number | undefined,
	canvas: { width: number; height: number },
	estimatedWidth = 120,
	estimatedHeight = 120
): void {
	// Creation and placement must be a single collaborative edit and undo step.
	Tree.runTransaction(items, () => {
		const item = create();
		if (!pan) return;
		const scale = zoom ?? 1;
		const handler = getContentHandler(item);
		const width = handler.type === "shape" ? handler.getSize() : estimatedWidth;
		const height = handler.type === "shape" ? handler.getSize() : estimatedHeight;
		item.x = (canvas.width / 2 - pan.x) / scale - width / 2;
		item.y = (canvas.height / 2 - pan.y) / scale - height / 2;
	});
}
