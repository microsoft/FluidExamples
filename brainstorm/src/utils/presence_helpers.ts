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

export class SelectionManager extends EventTarget {
	statesName: `${string}:${string}` = "name:brainstorm-presence";

	statesSchema = {
		// sets selected to an array of strings
		selected: Latest({ items: [] as string[] }),
	} satisfies PresenceStatesSchema;

	private valueManager: PresenceStatesEntries<typeof this.statesSchema>["selected"];

	constructor(presence: IPresence) {
		super();
		this.valueManager = presence.getStates(this.statesName, this.statesSchema).props.selected;
		this.valueManager.events.on("updated", () =>
			this.dispatchEvent(new Event("selectionChanged")),
		);
	}

	public testSelection<T extends { id: string }>(item: T) {
		return this.valueManager.local.items.indexOf(item.id) != -1;
	}

	public testRemoteSelection<T extends { id: string }>(item: T) {
		const remoteSelectedClients: string[] = [];

		for (const cv of this.valueManager.clientValues()) {
			if (cv.client.getConnectionStatus() === "Connected") {
				if (cv.value.items.indexOf(item.id) !== -1) {
					remoteSelectedClients.push(cv.client.sessionId);
				}
			}
		}

		return remoteSelectedClients.length > 0;
	}

	public updateSelection<T extends { id: string }>(item: T) {
		let arr: string[] = [];
		const i = this.valueManager.local.items.indexOf(item.id);
		if (i == -1) {
			arr = [item.id];
		}
		this.valueManager.local = { items: arr };

		// emit an event to notify the app that the selection has changed
		this.dispatchEvent(new Event("selectionChanged"));

		return;
	}

	public appendSelection<T extends { id: string }>(item: T) {
		const arr: string[] = this.valueManager.local.items.slice();
		const i = arr.indexOf(item.id);
		if (i == -1) {
			arr.push(item.id);
		} else {
			arr.splice(i, 1);
		}
		this.valueManager.local = { items: arr };

		// emit an event to notify the app that the selection has changed
		this.dispatchEvent(new Event("selectionChanged"));

		return;
	}

	public getSelected() {
		return this.valueManager.local.items;
	}

	public dispose() {
		this.valueManager.events.off("updated", () =>
			this.dispatchEvent(new Event("selectionChanged")),
		);
	}
}
