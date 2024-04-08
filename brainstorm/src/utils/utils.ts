/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Group, Items, Note } from "../schema/app_schema";
import { Guid } from "guid-typescript";
import { IInsecureUser } from "@fluidframework/test-runtime-utils";
import { Tree } from "fluid-framework";

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

export const generateTestUser = (): IInsecureUser => {
	const user = {
		id: Guid.create().toString(),
		name: "[TEST USER NAME]",
	};
	return user;
};

export enum dragType {
	NOTE = "Note",
	GROUP = "Group",
}

export enum selectAction {
	MULTI,
	REMOVE,
	SINGLE,
}

export function isUnder(group: Group, target: Items): boolean {
	// If the target is the group we are trying to move
	if (group.items === target) {
		return true;
	}

	// If the parent is a group, recursively check its parent items
	const parent = Tree.parent(target);
	if (Tree.is(parent, Group)) {
		const parentItems = Tree.parent(parent);
		if (Tree.is(parentItems, Items)) return isUnder(group, parentItems);
	}

	return false;
}
