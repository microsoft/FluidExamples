/**
 * Presence Context
 *
 * React context for managing all real-time collaborative presence features
 * in the Fluid Framework demo application. This context provides access to
 * all presence managers that handle different aspects of collaborative editing.
 *
 * Key Features:
 * - Centralized access to all presence managers
 * - User presence and profile management
 * - Multi-item selection synchronization (both items and table elements)
 * - Real-time drag and drop operations
 * - Collaborative resize operations
 * - Branch operation state management
 * - Type-safe access to all collaborative features
 *
 * This context is the main entry point for all collaborative functionality,
 * allowing components to access real-time state synchronization, user tracking,
 * and interactive operations that are shared across all connected clients.
 */

import { createContext } from "react";
import { type SelectionManager } from "../../presence/Interfaces/SelectionManager.js";
import { UsersManager } from "../../presence/Interfaces/UsersManager.js";
import { DragManager } from "../../presence/Interfaces/DragManager.js";
import { ResizeManager, ResizePackage } from "../../presence/Interfaces/ResizeManager.js";
import { CursorManager } from "../../presence/Interfaces/CursorManager.js";
import { DragAndRotatePackage } from "../../presence/drag.js";
import { TypedSelection } from "../../presence/selection.js";
import { InkPresenceManager } from "../../presence/Interfaces/InkManager.js";

/**
 * Type definition for the Presence Context.
 * Contains all presence managers and collaborative state.
 */
interface PresenceContextType {
	/** Manager for user presence, profiles, and connection status */
	users: UsersManager;

	/** Manager for item/shape selection state with real-time sync */
	itemSelection: SelectionManager<TypedSelection>;

	/** Manager for table element selection (rows, columns, cells) with real-time sync */
	tableSelection: SelectionManager<TypedSelection>;

	/** Manager for drag and drop operations with position and rotation tracking */
	drag: DragManager<DragAndRotatePackage | null>;

	/** Manager for resize operations with real-time dimension tracking */
	resize: ResizeManager<ResizePackage | null>;

	/** Manager for collaborative cursor tracking and real-time mouse position sync */
	cursor: CursorManager;

	/** Boolean flag indicating if branch operations are enabled/active */
	branch: boolean;

	/** Ephemeral ink presence (live in-progress stroke) */
	ink?: InkPresenceManager;
}

/**
 * React context for managing all collaborative presence features.
 * Provides access to real-time user tracking, selection synchronization,
 * drag operations, resize operations, and other collaborative functionality.
 *
 * Default values use empty objects cast to the appropriate types. These will be
 * replaced with actual manager instances when the PresenceContext.Provider is used.
 */
export const PresenceContext = createContext<PresenceContextType>({
	users: {} as UsersManager,
	itemSelection: {} as SelectionManager<TypedSelection>,
	tableSelection: {} as SelectionManager<TypedSelection>,
	drag: {} as DragManager<DragAndRotatePackage | null>,
	resize: {} as ResizeManager<ResizePackage | null>,
	cursor: {} as CursorManager,
	branch: false,
	ink: undefined,
});
