/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { StateFactory, type StatesWorkspace } from "@fluidframework/presence";
import type { SelectionManager } from "./Interfaces/SelectionManager.js";

export type selectionType = "row" | "column" | "cell";
export type TypedSelection = { id: string; type?: selectionType };

const selectionKey = (selection: TypedSelection) => JSON.stringify([selection.id, selection.type]);

export function createTypedSelectionManager(props: {
	workspace: StatesWorkspace<object>;
	name: string;
}): SelectionManager<TypedSelection> {
	const workspace: StatesWorkspace<object> = props.workspace;
	const { name } = props;
	workspace.add(name, StateFactory.latest<TypedSelection[]>({ local: [] }));
	const state = workspace.states[name];
	const matches = (a: TypedSelection, b: TypedSelection) => a.id === b.id && a.type === b.type;

	const manager: SelectionManager<TypedSelection> = {
		state,
		events: state.events,
		attendees: state.presence.attendees,
		testSelection(selection) {
			return state.local.some((candidate) => matches(candidate, selection));
		},
		testRemoteSelection(selection) {
			return [...state.getRemotes()]
				.filter(
					(remote) =>
						remote.attendee.getConnectionStatus() === "Connected" &&
						remote.value.some((candidate) => matches(candidate, selection))
				)
				.map((remote) => remote.attendee.attendeeId);
		},
		clearSelection() {
			if (state.local.length !== 0) state.local = [];
		},
		setSelection(selection) {
			const selections = Array.isArray(selection) ? selection : [selection];
			state.local = [
				...new Map(selections.map((value) => [selectionKey(value), value])).values(),
			];
		},
		toggleSelection(selection) {
			if (manager.testSelection(selection)) manager.removeFromSelection(selection);
			else manager.addToSelection(selection);
		},
		addToSelection(selection) {
			if (!manager.testSelection(selection)) state.local = [...state.local, selection];
		},
		removeFromSelection(selection) {
			if (manager.testSelection(selection)) {
				state.local = state.local.filter((candidate) => !matches(candidate, selection));
			}
		},
		getLocalSelection() {
			return state.local;
		},
		getRemoteSelected() {
			const selections = new Map<
				string,
				{ selection: TypedSelection; attendees: string[] }
			>();
			for (const remote of state.getRemotes()) {
				if (remote.attendee.getConnectionStatus() !== "Connected") continue;
				for (const selection of remote.value) {
					const key = selectionKey(selection);
					let entry = selections.get(key);
					if (!entry) {
						entry = { selection, attendees: [] };
						selections.set(key, entry);
					}
					if (!entry.attendees.includes(remote.attendee.attendeeId)) {
						entry.attendees.push(remote.attendee.attendeeId);
					}
				}
			}
			return new Map(
				[...selections.values()].map(({ selection, attendees }) => [selection, attendees])
			);
		},
	};
	return manager;
}
