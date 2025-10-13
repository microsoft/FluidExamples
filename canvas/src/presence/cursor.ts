/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * Cursor Manager Implementation
 *
 * This module provides the concrete implementation of the CursorManager interface
 * for managing real-time collaborative cursor tracking in the Fluid Framework demo app.
 *
 * Key Features:
 * - Real-time cursor position synchronization across all clients
 * - Canvas-relative coordinate tracking
 * - Visibility state management (show/hide cursors)
 * - Automatic cleanup of stale cursor data
 *
 * The cursor manager uses Fluid Framework's presence system to ensure that all
 * connected clients can see the mouse positions of other users when they are
 * over the canvas area. Each user maintains their own cursor state.
 */

import { StateFactory, StatesWorkspace, Latest, LatestEvents } from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { CursorManager } from "./Interfaces/CursorManager.js";
import { CursorState, validateCursorState } from "./validators.js";

/**
 * Creates a new CursorManager instance with the given workspace.
 * This factory function sets up the Fluid Framework state management and
 * returns a fully configured cursor manager.
 *
 * @param props - Configuration object containing workspace and name
 * @param props.workspace - The states workspace for state synchronization
 * @param props.name - Unique name for this cursor manager instance
 * @returns A configured CursorManager instance
 */
export function createCursorManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): CursorManager {
	const { workspace, name } = props;

	/**
	 * Concrete implementation of the CursorManager interface.
	 * Handles all cursor operations and state synchronization.
	 */
	class CursorManagerImpl implements CursorManager {
		/** Fluid Framework state object for real-time synchronization */
		state: Latest<CursorState | null>;

		/**
		 * Initializes the cursor manager with Fluid Framework state management.
		 * Sets up the latest state factory with validation and registers with the workspace.
		 *
		 * @param name - Unique identifier for this cursor manager
		 * @param workspace - Fluid workspace for state synchronization
		 */
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			// Register this cursor manager's state with the Fluid workspace
			// Using validated Latest state to ensure data integrity
			workspace.add(
				name,
				StateFactory.latest<CursorState | null>({
					local: null,
					validator: validateCursorState,
				})
			);
			this.state = workspace.states[name];
		}

		/**
		 * Client management interface providing access to attendees and their information.
		 * This allows the cursor manager to know who is connected and get their details.
		 */
		public get attendees() {
			return this.state.presence.attendees;
		}

		/**
		 * Event emitter for cursor state changes.
		 * Components can subscribe to these events to update their UI when cursor positions change.
		 */
		public get events(): Listenable<LatestEvents<CursorState | null>> {
			return this.state.events;
		}

		/**
		 * Updates the cursor position for the current user.
		 * This notifies all connected clients of the cursor movement.
		 *
		 * @param x - Canvas-relative X coordinate
		 * @param y - Canvas-relative Y coordinate
		 */
		public setCursorPosition(x: number, y: number): void {
			const currentState = this.state.local;
			this.state.local = {
				x,
				y,
				visible: currentState?.visible ?? true,
				timestamp: Date.now(),
			};
		}

		/**
		 * Shows the cursor for the current user.
		 * Called when mouse enters the canvas area.
		 */
		public showCursor(): void {
			const currentState = this.state.local;
			if (currentState) {
				this.state.local = {
					...currentState,
					visible: true,
					timestamp: Date.now(),
				};
			} else {
				// Initialize cursor state if it doesn't exist
				this.state.local = {
					x: 0,
					y: 0,
					visible: true,
					timestamp: Date.now(),
				};
			}
		}

		/**
		 * Hides the cursor for the current user.
		 * Called when mouse leaves the canvas area.
		 */
		public hideCursor(): void {
			const currentState = this.state.local;
			if (currentState) {
				this.state.local = {
					...currentState,
					visible: false,
					timestamp: Date.now(),
				};
			}
		}

		/**
		 * Gets all visible remote cursors (excludes current user and hidden cursors).
		 * @returns Array of cursor states from remote users that are currently visible
		 */
		public getVisibleRemoteCursors(): Array<{ state: CursorState; clientId: string }> {
			const visibleCursors: Array<{ state: CursorState; clientId: string }> = [];
			const now = Date.now();
			const staleThreshold = 30000; // 30 seconds

			// Get all remote cursor states
			const remotes = this.state.getRemotes();
			for (const remote of remotes) {
				const cursorState = remote.value();
				// Only include visible, non-stale cursors from connected clients
				if (
					cursorState &&
					cursorState.visible &&
					now - cursorState.timestamp < staleThreshold &&
					remote.attendee.getConnectionStatus() === "Connected"
				) {
					visibleCursors.push({
						state: cursorState,
						clientId: remote.attendee.attendeeId,
					});
				}
			}

			return visibleCursors;
		}
	}

	return new CursorManagerImpl(name, workspace);
}
