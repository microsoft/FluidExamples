/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	type IPresence,
	Latest,
	type PresenceStatesSchema,
	type PresenceStatesEntries,
} from "@fluidframework/presence/alpha";
import type { Note } from "../schema/app_schema.js";
import { selectAction } from "./utils.js";

export class SelectionManager extends EventTarget {
	private valueManager: BrainstormSelection;

	constructor(presence: IPresence) {
		super();
		this.valueManager = presence.getStates(statesName, statesSchema).props.selected;
		this.valueManager.events.on("updated", () =>
			this.dispatchEvent(new Event("selectionChanged")),
		);
	}

	public testNoteSelection(note: Note) {
		return testNoteSelection(note, this.valueManager);
	}

	public testNoteRemoteSelection(note: Note) {
		return testNoteRemoteSelection(note, this.valueManager);
	}

	public updateNoteSelection(note: Note, action: selectAction) {
		// emit an event to notify the app that the selection has changed
		this.dispatchEvent(new Event("selectionChanged"));
		updateNoteSelection(note, action, this.valueManager);
	}

	public getSelectedNotes() {
		return getSelectedNotes(this.valueManager);
	}
}

const statesName = "name:brainstorm-presence";

const statesSchema = {
	// sets selected to an array of strings
	selected: Latest({ notes: [] as string[] }),
} satisfies PresenceStatesSchema;

type BrainstormSelection = PresenceStatesEntries<typeof statesSchema>["selected"];

const testNoteSelection = (note: Note, latestValueManager: BrainstormSelection): boolean => {
	return latestValueManager.local.notes.indexOf(note.id) != -1;
};

const testNoteRemoteSelection = (note: Note, latestValueManager: BrainstormSelection): boolean => {
	const remoteSelectedClients: string[] = [];

	for (const cv of latestValueManager.clientValues()) {
		if (cv.client.getConnectionStatus() === "Connected") {
			if (cv.value.notes.indexOf(note.id) !== -1) {
				remoteSelectedClients.push(cv.client.sessionId);
			}
		}
	}

	return remoteSelectedClients.length > 0;
};

const updateNoteSelection = (
	note: Note,
	action: selectAction,
	latestValueManager: BrainstormSelection,
) => {
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

const getSelectedNotes = (latestValueManager: BrainstormSelection): readonly string[] => {
	return latestValueManager.local.notes;
};
