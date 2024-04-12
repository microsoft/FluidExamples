/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Note } from "../schema/app_schema.js";

export const undefinedUserId = "[UNDEFINED]";

export function getRotation(note: Note) {
	const i = hashCode(note.id);

	const rotationArray = [
		"rotate-1",
		"-rotate-2",
		"rotate-2",
		"-rotate-1",
		"-rotate-3",
		"rotate-3",
	];

	return rotationArray[i % rotationArray.length];
}

function hashCode(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = 31 * h + str.charCodeAt(i);
	}
	return h;
}

export enum dragType {
	NOTE = "Note",
	GROUP = "Group",
}

export enum selectAction {
	MULTI,
	REMOVE,
	SINGLE,
}
