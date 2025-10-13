/**
 * DragManager Interface
 *
 * Manages drag and drop operations for shapes and elements in the Fluid Framework demo app.
 * This interface extends PresenceManager to provide real-time synchronization of drag states
 * across all connected clients.
 *
 * Key Features:
 * - Real-time drag state synchronization
 * - Position tracking during drag operations
 * - Multi-client drag conflict resolution
 * - Clean up of drag states when operations complete
 */

import { PresenceManager } from "./PresenceManager.js";
import { DragAndRotatePackage } from "../validators.js";

/**
 * DragManager interface for managing drag and drop functionality in the collaborative app.
 * Extends PresenceManager to provide real-time synchronization of drag operations.
 *
 * @template TDragPackage - The type of drag data package
 */
export interface DragManager<TDragPackage> extends PresenceManager<TDragPackage> {
	/**
	 * Sets the drag target and position for the current user.
	 * This notifies all connected clients that the current user is dragging an element.
	 *
	 * @param target - The drag package containing element ID and position data
	 *
	 * Use cases:
	 * - When user starts dragging a shape
	 * - During drag operations to update position
	 * - For visual feedback to other users about ongoing drag operations
	 */
	setDragging(target: TDragPackage): void;

	/**
	 * Clears the drag data for the local client.
	 * This notifies all connected clients that the current user has stopped dragging.
	 * Should be called when drag operation completes or is cancelled.
	 *
	 * Use cases:
	 * - When user drops an element
	 * - When drag operation is cancelled (ESC key)
	 * - When cleaning up after drag completion
	 */
	clearDragging(): void;
}
