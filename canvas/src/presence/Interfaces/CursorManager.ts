/**
 * CursorManager Interface
 *
 * Manages collaborative mouse cursor/pointer tracking for real-time visualization
 * of remote user mouse positions on the canvas. This interface follows the same
 * pattern as other presence managers using LatestRaw for per-user state tracking.
 *
 * Key Features:
 * - Real-time cursor position synchronization
 * - Canvas-relative coordinate tracking
 * - Visibility state management (show/hide cursors when mouse enters/leaves canvas)
 * - Automatic cleanup of stale cursor data
 */

import { PresenceManager } from "./PresenceManager.js";
import { CursorState } from "../validators.js";

// Re-export type for external consumers
export type { CursorState };

/**
 * CursorManager interface for managing collaborative cursor tracking.
 * Extends PresenceManager to provide real-time synchronization of cursor positions.
 * Each user has their own cursor state that is synchronized across all clients.
 */
export interface CursorManager extends PresenceManager<CursorState | null> {
	/**
	 * Updates the cursor position for the current user.
	 * This notifies all connected clients of the cursor movement.
	 *
	 * @param x - Canvas-relative X coordinate
	 * @param y - Canvas-relative Y coordinate
	 */
	setCursorPosition(x: number, y: number): void;

	/**
	 * Shows the cursor for the current user.
	 * Called when mouse enters the canvas area.
	 */
	showCursor(): void;

	/**
	 * Hides the cursor for the current user.
	 * Called when mouse leaves the canvas area.
	 */
	hideCursor(): void;

	/**
	 * Gets all visible remote cursors (excludes current user and hidden cursors).
	 * @returns Array of cursor states from remote users that are currently visible
	 */
	getVisibleRemoteCursors(): Array<{ state: CursorState; clientId: string }>;
}
