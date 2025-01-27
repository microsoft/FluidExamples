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
	statesName: `${string}:${string}` = "name:brainstorm-presence";

	statesSchema = {
		// sets selected to an array of strings
		selected: Latest({ notes: [] as string[] }),
	} satisfies PresenceStatesSchema;

	private valueManager: PresenceStatesEntries<typeof this.statesSchema>["selected"];

	constructor(presence: IPresence) {
		super();
		this.valueManager = presence.getStates(this.statesName, this.statesSchema).props.selected;
		this.valueManager.events.on("updated", () =>
			this.dispatchEvent(new Event("selectionChanged")),
		);
	}

	public testNoteSelection(note: Note) {
		return this.valueManager.local.notes.indexOf(note.id) != -1;
	}

	public testNoteRemoteSelection(note: Note) {
		const remoteSelectedClients: string[] = [];

		for (const cv of this.valueManager.clientValues()) {
			if (cv.client.getConnectionStatus() === "Connected") {
				if (cv.value.notes.indexOf(note.id) !== -1) {
					remoteSelectedClients.push(cv.client.sessionId);
				}
			}
		}

		return remoteSelectedClients.length > 0;
	}

	public updateNoteSelection(note: Note, action: selectAction) {
		// emit an event to notify the app that the selection has changed
		this.dispatchEvent(new Event("selectionChanged"));
		if (action == selectAction.MULTI) {
			const arr: string[] = this.valueManager.local.notes.slice();
			const i = arr.indexOf(note.id);
			if (i == -1) {
				arr.push(note.id);
			} else {
				arr.splice(i, 1);
			}
			this.valueManager.local = { notes: arr };
		}

		if (action == selectAction.SINGLE) {
			let arr: string[] = [];
			const i = this.valueManager.local.notes.indexOf(note.id);
			if (i == -1) {
				arr = [note.id];
			}
			this.valueManager.local = { notes: arr };
		}

		return;
	}

	public getSelectedNotes() {
		return this.valueManager.local.notes;
	}

	public dispose() {
		this.valueManager.events.off("updated", () =>
			this.dispatchEvent(new Event("selectionChanged")),
		);
	}
}
