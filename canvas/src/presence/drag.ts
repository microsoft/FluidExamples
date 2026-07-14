/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * Drag Manager Implementation
 *
 * This module provides the concrete implementation of the DragManager interface
 * for managing real-time drag and drop operations in the Fluid Framework demo app.
 *
 * Key Features:
 * - Real-time drag state synchronization across all clients
 * - Position and rotation tracking during drag operations
 * - Branch dragging support for tree structures
 * - Automatic cleanup of drag states
 * - Event-driven updates for UI responsiveness
 *
 * The drag manager uses Fluid Framework's presence system to ensure that all
 * connected clients can see when someone is dragging an element, including
 * the current position and rotation of the dragged item.
 */

import {
	StateFactory,
	StatesWorkspace,
	LatestRaw,
	LatestRawEvents,
} from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { DragManager, DragPackage } from "./Interfaces/DragManager.js";

/**
 * Creates a new DragManager instance with the given presence and workspace.
 * This factory function sets up the Fluid Framework state management and
 * returns a fully configured drag manager.
 *
 * @param props - Configuration object containing presence, workspace, and name
 * @param props.workspace - The states workspace for state synchronization
 * @param props.name - Unique name for this drag manager instance
 * @returns A configured DragManager instance
 */
export function createDragManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): DragManager<DragAndRotatePackage | null> {
	const { workspace, name } = props;

	/**
	 * Concrete implementation of the DragManager interface.
	 * Handles all drag operations and state synchronization.
	 */
	class DragManagerImpl implements DragManager<DragAndRotatePackage | null> {
		/** Fluid Framework state object for real-time synchronization */
		state: LatestRaw<DragAndRotatePackage | null>;

		/**
		 * Initializes the drag manager with Fluid Framework state management.
		 * Sets up the latest state factory and registers with the workspace.
		 *
		 * @param name - Unique identifier for this drag manager
		 * @param workspace - Fluid workspace for state synchronization
		 */
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			// Register this drag manager's state with the Fluid workspace
			workspace.add(name, StateFactory.latest<DragAndRotatePackage | null>({ local: null }));
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
		 * Event emitter for drag state changes.
		 * Components can subscribe to these events to update their UI when drag operations occur.
		 */
		public get events(): Listenable<LatestRawEvents<DragAndRotatePackage | null>> {
			return this.state.events;
		}

		/**
		 * Indicates that an item is being dragged by setting the drag state.
		 * This notifies all connected clients about the ongoing drag operation.
		 *
		 * @param target - The drag package containing item ID, position, rotation, and branch info
		 */
		public setDragging(target: DragAndRotatePackage) {
			this.state.local = target;
		}

		/**
		 * Clears the drag data for the local client.
		 * This should be called when the drag operation completes or is cancelled.
		 * Notifies all clients that this user is no longer dragging anything.
		 */
		public clearDragging() {
			this.state.local = null;
		}
	}

	return new DragManagerImpl(name, workspace);
}

/**
 * Extended drag package type that includes rotation and branch information.
 * This is more comprehensive than the base DragPackage to support the demo's features.
 */
export interface DragAndRotatePackage extends DragPackage {
	/** Current rotation angle of the dragged element in degrees */
	rotation: number;
	/** Whether this is a branch drag operation (for tree structures) */
	branch: boolean;
}
