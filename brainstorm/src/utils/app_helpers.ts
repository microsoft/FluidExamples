/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tree, TreeStatus } from "fluid-framework";
import { Note, Group, Items } from "../schema/app_schema.js";

// Move a note from one position in a sequence to another position in the same sequence or
// in a different sequence. The index being passed here is the desired index after the move.
export function moveItem(item: Note | Group, destinationIndex: number, destination: Items) {
	// need to test that the destination or the item being dragged hasn't been deleted
	// because the move may have been initiated through a drag and drop which
	// is asynchronous - the state may have changed during the drag but this function
	// is operating based on the state at the moment the drag began
	if (
		Tree.status(destination) != TreeStatus.InDocument ||
		Tree.status(item) != TreeStatus.InDocument
	)
		return;

	const source = Tree.parent(item);
	// Use Tree.is to narrow the type of source to the items schema
	if (!Tree.is(source, Items)) return;

	const index = source.indexOf(item);

	if (destinationIndex == Infinity) {
		destination.moveToEnd(index, source);
	} else {
		// test that the destination index is valid
		if (destination.length < destinationIndex) {
			return;
		}
		destination.moveToIndex(destinationIndex, index, source);
	}
}

export function findNote(items: Items, id: string): Note | undefined {
	for (const i of items) {
		if (Tree.is(i, Note)) {
			if (i.id === id) return i;
		} else {
			const n = findNote(i.items, id);
			if (n !== undefined) {
				return n;
			}
		}
	}
	return undefined;
}
