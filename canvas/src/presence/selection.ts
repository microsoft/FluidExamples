/* eslint-disable @typescript-eslint/no-empty-object-type */
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Selection Manager Implementation
 *
 * This module provides concrete implementations of the SelectionManager interface
 * for managing real-time selection state in the Fluid Framework demo app.
 * It supports both basic selections and typed selections with enhanced functionality.
 *
 * Key Features:
 * - Multi-select support with robust state management
 * - Real-time selection synchronization across all clients
 * - Typed selections for different element types (rows, columns, cells)
 * - Remote selection tracking to show what others have selected
 * - Transactional operations (add, remove, toggle, clear)
 * - Visual conflict prevention and collaboration indicators
 * - Event-driven updates for responsive UI
 *
 * The selection managers use Fluid Framework's presence system to ensure that all
 * connected clients can see what others have selected in real-time, enabling
 * smooth collaborative editing experiences.
 */

import { StateFactory, LatestEvents, StatesWorkspace, Latest } from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { SelectionManager } from "./Interfaces/SelectionManager.js";
import {
	Selection,
	TypedSelection,
	selectionType,
	validateSelectionArray,
	validateTypedSelectionArray,
} from "./validators.js";

// Re-export types for external consumers
export type { TypedSelection, selectionType };

/**
 * Creates a new SelectionManager instance for managing collaborative selections.
 * This manager handles multi-select operations and real-time state synchronization
 * across all connected clients in the Fluid Framework workspace.
 *
 * @param props - Configuration object containing workspace and name
 * @param props.workspace - The states workspace for state synchronization
 * @param props.name - Unique name for this selection manager instance
 * @returns A configured SelectionManager instance
 */
export function createSelectionManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): SelectionManager<Selection> {
	const { workspace, name } = props;

	/**
	 * Implementation of the SelectionManager interface.
	 * Handles multi-select operations and real-time state synchronization.
	 */
	class SelectionManagerImpl implements SelectionManager<Selection> {
		/** Fluid Framework state object for real-time synchronization */
		state: Latest<Selection[]>;

		/**
		 * Initializes the selection manager with Fluid Framework state management.
		 * Sets up the latest state factory with validation and registers with the workspace.
		 *
		 * @param name - Unique identifier for this selection manager
		 * @param workspace - Fluid workspace for state synchronization
		 */
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			// Register this selection manager's state with the Fluid workspace
			// Using validated Latest state to ensure data integrity
			workspace.add(
				name,
				StateFactory.latest<Selection[]>({ local: [], validator: validateSelectionArray })
			);
			this.state = workspace.states[name];
		}

		/**
		 * Event emitter for selection state changes.
		 * Components can subscribe to these events to update their UI when selections change.
		 */
		public get events(): Listenable<LatestEvents<Selection[]>> {
			return this.state.events;
		}

		/**
		 * Client management interface providing access to attendees and their information.
		 * This allows the selection manager to know who is connected and get their details.
		 */
		public get attendees() {
			return this.state.presence.attendees;
		}

		/**
		 * Tests if the given selection is currently selected by the local client.
		 *
		 * @param sel - The selection to test
		 * @returns True if the selection is currently selected locally
		 */
		public testSelection(sel: Selection) {
			return this._testForInclusion(sel, this.state.local);
		}

		/**
		 * Tests if the given selection is selected by any remote client.
		 * Returns an array of client IDs who have this selection.
		 *
		 * @param sel - The selection to test
		 * @returns Array of attendee IDs who have selected this item
		 */
		public testRemoteSelection(sel: Selection): string[] {
			const remoteSelectedClients: string[] = [];
			for (const cv of this.state.getRemotes()) {
				if (cv.attendee.getConnectionStatus() === "Connected") {
					const remoteValue = cv.value();
					if (remoteValue && this._testForInclusion(sel, remoteValue)) {
						remoteSelectedClients.push(cv.attendee.attendeeId);
					}
				}
			}
			return remoteSelectedClients;
		}

		/**
		 * Clears all current selections for the local client.
		 * This will notify all other clients that this user has deselected everything.
		 */
		public clearSelection() {
			this.state.local = [];
		}

		/**
		 * Sets the selection to the given item(s), replacing any existing selection.
		 *
		 * @param sel - A single selection or array of selections to set
		 *
		 * Note: This will overwrite the current local selection completely.
		 * Use addToSelection() or toggleSelection() to maintain existing selections.
		 */
		public setSelection(sel: Selection | Selection[]) {
			if (Array.isArray(sel)) {
				// If an array of selections is provided, set it directly
				this.state.local = sel;
			} else {
				// Otherwise, create an array with the single selection
				this.state.local = [sel];
			}
		}

		/**
		 * Toggles the selection state of the given item.
		 * If the item is selected, it will be deselected. If not selected, it will be added to selection.
		 *
		 * @param sel - The selection to toggle
		 */
		public toggleSelection(sel: Selection) {
			if (this.testSelection(sel)) {
				this.removeFromSelection(sel);
			} else {
				this.addToSelection(sel);
			}
		}

		/**
		 * Adds the given selection to the current selection set.
		 * If the item is already selected, this operation has no effect.
		 *
		 * @param sel - The selection to add
		 */
		public addToSelection(sel: Selection) {
			const arr: Selection[] = this.state.local.slice();
			if (!this._testForInclusion(sel, arr)) {
				arr.push(sel);
			}
			this.state.local = arr;
		}

		/**
		 * Removes the given selection from the current selection set.
		 * If the item is not currently selected, this operation has no effect.
		 *
		 * @param sel - The selection to remove
		 */
		public removeFromSelection(sel: Selection) {
			const arr: Selection[] = this.state.local.filter((s: Selection) => s.id !== sel.id);
			this.state.local = arr;
		}

		/**
		 * Gets the current local selection array.
		 * This represents what the current user has selected.
		 *
		 * @returns Read-only array of current local selections
		 */
		public getLocalSelection(): readonly Selection[] {
			return this.state.local;
		}

		/**
		 * Gets a map of all remote selections organized by selected item.
		 * The key is the selected item and the value is an array of client IDs who have selected it.
		 * This is useful for showing collaboration indicators in the UI.
		 *
		 * @returns Map where keys are selections and values are arrays of attendee IDs
		 */
		public getRemoteSelected(): Map<Selection, string[]> {
			const remoteSelected = new Map<Selection, string[]>();
			for (const cv of this.state.getRemotes()) {
				if (cv.attendee.getConnectionStatus() === "Connected") {
					const remoteValue = cv.value();
					if (remoteValue) {
						for (const sel of remoteValue) {
							if (!remoteSelected.has(sel)) {
								remoteSelected.set(sel, []);
							}
							remoteSelected.get(sel)?.push(cv.attendee.attendeeId);
						}
					}
				}
			}

			return remoteSelected;
		}

		/**
		 * Private helper method to test if a selection is included in a collection.
		 * Uses ID-based comparison for selection matching.
		 *
		 * @param sel - The selection to test for
		 * @param collection - The collection to search in
		 * @returns True if the selection is found in the collection
		 */
		private _testForInclusion(sel: Selection, collection: readonly Selection[]): boolean {
			return !!collection.find((s) => s.id === sel.id);
		}
	}

	return new SelectionManagerImpl(name, workspace);
}

/**
 * Creates a typed selection manager with TypedSelection support.
 * This implementation specifically handles selections with type information.
 *
 * @param props - Configuration object containing workspace and name
 * @returns A configured SelectionManager for TypedSelection objects
 */
export function createTypedSelectionManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): SelectionManager<TypedSelection> {
	const { workspace, name } = props;

	/**
	 * Implementation of the SelectionManager interface for TypedSelection.
	 * This is nearly identical to the basic SelectionManager but typed for TypedSelection.
	 */
	class TypedSelectionManagerImpl implements SelectionManager<TypedSelection> {
		/** Fluid Framework state object for real-time synchronization */
		state: Latest<TypedSelection[]>;

		/**
		 * Initializes the selection manager with Fluid Framework state management.
		 */
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			workspace.add(
				name,
				StateFactory.latest<TypedSelection[]>({
					local: [],
					validator: validateTypedSelectionArray,
				})
			);
			this.state = workspace.states[name];
		}

		public get events(): Listenable<LatestEvents<TypedSelection[]>> {
			return this.state.events;
		}

		public get attendees() {
			return this.state.presence.attendees;
		}

		public testSelection(sel: TypedSelection) {
			return this._testForInclusion(sel, this.state.local);
		}

		public testRemoteSelection(sel: TypedSelection): string[] {
			const remoteSelectedClients: string[] = [];
			for (const cv of this.state.getRemotes()) {
				if (cv.attendee.getConnectionStatus() === "Connected") {
					const remoteValue = cv.value();
					if (remoteValue && this._testForInclusion(sel, remoteValue)) {
						remoteSelectedClients.push(cv.attendee.attendeeId);
					}
				}
			}
			return remoteSelectedClients;
		}

		public clearSelection() {
			this.state.local = [];
		}

		public setSelection(sel: TypedSelection | TypedSelection[]) {
			if (Array.isArray(sel)) {
				this.state.local = sel;
			} else {
				this.state.local = [sel];
			}
		}

		public toggleSelection(sel: TypedSelection) {
			if (this.testSelection(sel)) {
				this.removeFromSelection(sel);
			} else {
				this.addToSelection(sel);
			}
		}

		public addToSelection(sel: TypedSelection) {
			const arr: TypedSelection[] = this.state.local.slice();
			if (!this._testForInclusion(sel, arr)) {
				arr.push(sel);
			}
			this.state.local = arr;
		}

		public removeFromSelection(sel: TypedSelection) {
			const arr: TypedSelection[] = this.state.local.filter(
				(s: TypedSelection) => s.id !== sel.id
			);
			this.state.local = arr;
		}

		public getLocalSelection(): readonly TypedSelection[] {
			return this.state.local;
		}

		public getRemoteSelected(): Map<TypedSelection, string[]> {
			const remoteSelected = new Map<TypedSelection, string[]>();
			for (const cv of this.state.getRemotes()) {
				if (cv.attendee.getConnectionStatus() === "Connected") {
					const remoteValue = cv.value();
					if (remoteValue) {
						for (const sel of remoteValue) {
							if (!remoteSelected.has(sel)) {
								remoteSelected.set(sel, []);
							}
							remoteSelected.get(sel)?.push(cv.attendee.attendeeId);
						}
					}
				}
			}
			return remoteSelected;
		}

		private _testForInclusion(
			sel: TypedSelection,
			collection: readonly TypedSelection[]
		): boolean {
			return !!collection.find((s) => s.id === sel.id);
		}
	}

	return new TypedSelectionManagerImpl(name, workspace);
}
