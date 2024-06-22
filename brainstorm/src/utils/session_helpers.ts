/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Note } from "../schema/app_schema.js";
import { Session, Client } from "../schema/session_schema.js";
import { selectAction, undefinedUserId } from "./utils.js";

export const testRemoteNoteSelection = (
	note: Note,
	session: Session,
	clientId: string,
	fluidMembers: string[],
): { selected: boolean; remoteSelected: boolean } => {
	if (clientId == undefinedUserId) return { selected: false, remoteSelected: false };

	let selected = false;
	let remoteSelected = false;

	for (const c of session.clients) {
		if (c.clientId == clientId) {
			if (c.selected.indexOf(note.id) != -1) {
				selected = true;
			}
		}

		if (c.clientId != clientId && fluidMembers.indexOf(c.clientId) != -1) {
			if (c.selected.indexOf(note.id) != -1) {
				remoteSelected = true;
			}
		}
	}

	return { selected, remoteSelected };
};

export const updateRemoteNoteSelection = (
	note: Note,
	action: selectAction,
	session: Session,
	clientId: string,
) => {
	if (clientId == undefinedUserId) return;

	// Handle removed items and bail
	if (action == selectAction.REMOVE) {
		for (const c of session.clients) {
			if (c.clientId === clientId) {
				const i = c.selected.indexOf(note.id);
				if (i != -1) c.selected.removeAt(i);
				return;
			}
		}
		return;
	}

	if (action == selectAction.MULTI) {
		for (const c of session.clients) {
			if (c.clientId === clientId) {
				const i = c.selected.indexOf(note.id);
				if (i == -1) c.selected.insertAtEnd(note.id);
				return;
			}
		}
	}

	if (action == selectAction.SINGLE) {
		console.log(clientId);
		for (const c of session.clients) {
			if (c.clientId === clientId) {
				if (c.selected.length > 0) c.selected.removeRange(0);
				c.selected.insertAtStart(note.id);
				return;
			}
		}
	}

	const s = new Client({
		clientId: clientId,
		selected: [note.id],
	});

	session.clients.insertAtEnd(s);
};

export const getSelectedNotes = (session: Session, clientId: string): string[] => {
	for (const c of session.clients) {
		if (c.clientId == clientId) {
			return c.selected.concat();
		}
	}
	return [];
};

export const cleanSessionData = (session: Session, fluidMembers: string[]) => {
	const deleteMe: Client[] = [];
	for (const c of session.clients) {
		if (!fluidMembers.includes(c.clientId)) {
			deleteMe.push(c);
		}
	}

	for (const c of deleteMe) {
		session.clients.removeAt(session.clients.indexOf(c));
	}
};
