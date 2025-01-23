/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	IPresence,
	Latest,
	PresenceStates,
	PresenceStatesSchema,
} from "@fluidframework/presence/alpha";
import { Note } from "../schema/app_schema.js";
import { selectAction } from "./utils.js";

export const testNoteSelection = (
	note: Note,
	presence: IPresence,
): { selected: boolean; remoteSelected: boolean } => {
	console.log(
		"testNoteSelection",
		note.id,
		presence.getStates(statesName, statesSchema).props.selected.local,
	);

	let selected = false;
	let remoteSelected = false;

	const latestValueManager = presence.getStates(statesName, statesSchema).props.selected;

	const id = presence.getMyself().sessionId;

	if (id === undefined) {
		return { selected, remoteSelected };
	}

	for (const cv of latestValueManager.clientValues()) {
		if (cv.client.getConnectionStatus() === "Connected") {
			if (cv.value.notes.indexOf(note.id) != -1) {
				remoteSelected = true;
			}
		}
	}

	selected = latestValueManager.local.notes.indexOf(note.id) != -1;

	console.log("selected", selected, "remoteSelected", remoteSelected);

	return { selected, remoteSelected };
};

export const updateNoteSelection = (note: Note, action: selectAction, presence: IPresence) => {
	const latestValueManager = presence.getStates(statesName, statesSchema).props.selected;

	if (action == selectAction.MULTI) {
		const arr: string[] = latestValueManager.local.notes.slice();
		const i = arr.indexOf(note.id);
		if (i == -1) {
			arr.push(note.id);
		} else {
			arr.splice(i, 1);
		}
		latestValueManager.local = { notes: arr };
	}

	if (action == selectAction.SINGLE) {
		let arr: string[] = [];
		const i = latestValueManager.local.notes.indexOf(note.id);
		if (i == -1) {
			arr = [note.id];
		}
		latestValueManager.local = { notes: arr };
	}

	return;
};

export const getSelectedNotes = (presence: IPresence): readonly string[] => {
	return presence.getStates(statesName, statesSchema).props.selected.local.notes;
};

export const statesName = "name:brainstorm-presence";

export const statesSchema = {
	// sets selected to an array of strings
	selected: Latest({ notes: [] as string[] }),
} satisfies PresenceStatesSchema;

export type BrainstormPresence = PresenceStates<typeof statesSchema>;

export function buildPresence(presence: IPresence): BrainstormPresence {
	const states = presence.getStates("name:brainstorm-presence", statesSchema);
	return states;
}
