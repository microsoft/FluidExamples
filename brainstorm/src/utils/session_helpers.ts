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
import type { Listenable } from "fluid-framework";
import type { Note } from "../schema/app_schema.js";
import { selectAction } from "./utils.js";
import { createEmitter } from "./emitter.js";

interface SelectionManagerEvents {
	updated: () => void;
}

export interface SelectionManager {
	readonly events: Listenable<SelectionManagerEvents>;
	testNoteSelection(note: Note): { selected: boolean; remoteSelected: boolean };
	updateNoteSelection(note: Note, action: selectAction): void;
	getSelectedNotes(): readonly string[];
}

const statesName = "name:brainstorm-presence";

const statesSchema = {
	// sets selected to an array of strings
	selected: Latest({ notes: [] as string[] }),
} satisfies PresenceStatesSchema;

type BrainstormSelection = PresenceStatesEntries<typeof statesSchema>["selected"];

const testNoteSelection = (
	note: Note,
	latestValueManager: BrainstormSelection,
): { selected: boolean; remoteSelected: boolean } => {
	const remoteSelectedClients: string[] = [];

	for (const cv of latestValueManager.clientValues()) {
		if (cv.client.getConnectionStatus() === "Connected") {
			if (cv.value.notes.indexOf(note.id) !== -1) {
				remoteSelectedClients.push(cv.client.sessionId);
			}
		}
	}

	const selected = latestValueManager.local.notes.indexOf(note.id) != -1;
	const remoteSelected = remoteSelectedClients.length > 0;

	return { selected, remoteSelected };
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

export function buildSelectionManager(presence: IPresence): SelectionManager {
	const valueManager = presence.getStates(statesName, statesSchema).props.selected;
	const events = createEmitter<SelectionManagerEvents>();
	valueManager.events.on("updated", () => events.emit("updated"));
	return {
		events,
		testNoteSelection: (note: Note) => testNoteSelection(note, valueManager),
		updateNoteSelection: (note: Note, action: selectAction) => {
			events.emit("updated");
			updateNoteSelection(note, action, valueManager);
		},
		getSelectedNotes: () => getSelectedNotes(valueManager),
	};
}
