/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * Resize Manager Implementation
 *
 * This module provides the concrete implementation of the ResizeManager interface
 * for managing real-time resize operations in the Fluid Framework demo app.
 *
 * Key Features:
 * - Real-time resize state synchronization across all clients
 * - Position and size tracking during resize operations
 * - Visual feedback for ongoing resize operations
 * - Conflict prevention when multiple users try to resize the same element
 * - Automatic cleanup of resize states
 * - Event-driven updates for responsive UI
 *
 * The resize manager uses Fluid Framework's presence system to ensure that all
 * connected clients can see when someone is resizing an element, including
 * the current position and size of the element being resized.
 */

import {
	StateFactory,
	StatesWorkspace,
	LatestRaw,
	LatestRawEvents,
} from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { ResizeManager, ResizePackage } from "./Interfaces/ResizeManager.js";

/**
 * Creates a new ResizeManager instance with the given workspace configuration.
 * This factory function sets up the Fluid Framework state management and
 * returns a fully configured resize manager.
 *
 * @param props - Configuration object containing workspace and name
 * @param props.workspace - The states workspace for state synchronization
 * @param props.name - Unique name for this resize manager instance
 * @returns A configured ResizeManager instance
 */
export function createResizeManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): ResizeManager<ResizePackage | null> {
	const { workspace, name } = props;

	/**
	 * Concrete implementation of the ResizeManager interface.
	 * Handles all resize operations and state synchronization.
	 */
	class ResizeManagerImpl implements ResizeManager<ResizePackage | null> {
		/** Fluid Framework state object for real-time synchronization */
		state: LatestRaw<ResizePackage | null>;

		/**
		 * Initializes the resize manager with Fluid Framework state management.
		 * Sets up the latest state factory and registers with the workspace.
		 *
		 * @param name - Unique identifier for this resize manager
		 * @param workspace - Fluid workspace for state synchronization
		 */
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			// Register this resize manager's state with the Fluid workspace
			workspace.add(name, StateFactory.latest<ResizePackage | null>({ local: null }));
			this.state = workspace.states[name];
		}

		/**
		 * Client management interface providing access to attendees and their information.
		 * This allows the selection manager to know who is connected and get their details.
		 */
		public get attendees() {
			return this.state.presence.attendees;
		}

		/**
		 * Event emitter for resize state changes.
		 * Components can subscribe to these events to update their UI when resize operations occur.
		 */
		public get events(): Listenable<LatestRawEvents<ResizePackage | null>> {
			return this.state.events;
		}

		/**
		 * Indicates that an item is being resized by setting the resize state.
		 * This notifies all connected clients about the ongoing resize operation,
		 * allowing them to show visual feedback and prevent conflicts.
		 *
		 * @param target - The resize package containing item ID, position, and size info
		 */
		public setResizing(target: ResizePackage) {
			this.state.local = target;
		}

		/**
		 * Clears the resize data for the local client.
		 * This should be called when the resize operation completes or is cancelled.
		 * Notifies all clients that this user is no longer resizing anything.
		 */
		public clearResizing() {
			this.state.local = null;
		}
	}

	return new ResizeManagerImpl(name, workspace);
}
