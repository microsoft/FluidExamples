/**
 * ResizeManager Interface
 *
 * Manages resize operations for shapes and elements in the Fluid Framework demo app.
 * This interface extends PresenceManager to provide real-time synchronization of resize states
 * across all connected clients, ensuring that all users can see when someone is actively
 * resizing an element.
 *
 * Key Features:
 * - Real-time resize state synchronization
 * - Position and size tracking during resize operations
 * - Visual feedback for ongoing resize operations
 * - Multi-client resize conflict prevention
 * - Clean up of resize states when operations complete
 */

import { PresenceManager } from "./PresenceManager.js";
import { ResizePackage } from "../validators.js";

// Re-export type for external consumers
export type { ResizePackage };

/**
 * ResizeManager interface for managing resize functionality for shapes in the app.
 * Extends PresenceManager to provide real-time synchronization of resize operations.
 *
 * @template TResizePackage - The type of resize data package, defaults to ResizePackage | null
 */
export interface ResizeManager<TResizePackage extends ResizePackage | null = ResizePackage | null>
	extends PresenceManager<TResizePackage> {
	/**
	 * Sets the resize target and current dimensions for the current user.
	 * This notifies all connected clients that the current user is resizing an element.
	 *
	 * @param target - The resize package containing element ID, position, and size data
	 *
	 * Use cases:
	 * - When user starts resizing a shape (mouse down on resize handle)
	 * - During resize operations to update dimensions in real-time
	 * - For providing visual feedback to other users about ongoing resize operations
	 * - To prevent conflicts when multiple users try to resize the same element
	 */
	setResizing(target: TResizePackage): void;

	/**
	 * Clears the resize data for the local client.
	 * This notifies all connected clients that the current user has stopped resizing.
	 * Should be called when resize operation completes or is cancelled.
	 *
	 * Use cases:
	 * - When user releases mouse after completing resize
	 * - When resize operation is cancelled (ESC key, click elsewhere)
	 * - When cleaning up after resize completion
	 * - To allow other users to resize the same element
	 */
	clearResizing(): void;
}
