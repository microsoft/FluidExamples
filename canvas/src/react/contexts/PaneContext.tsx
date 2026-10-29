/**
 * Pane Context
 *
 * React context for managing UI pane visibility and state in the Fluid Framework demo app.
 * This context tracks which panes (sidebars, panels, dialogs, etc.) are currently
 * visible and provides a centralized way to manage the application's layout state.
 *
 * Key Features:
 * - Centralized pane visibility management
 * - Named pane tracking for flexible layout control
 * - Type-safe pane state management
 * - Easy integration with layout components
 *
 * Each pane has a name and visibility state, allowing components to show/hide
 * different parts of the UI in a coordinated manner.
 */

import { createContext } from "react";

/**
 * Type definition for a single pane in the application.
 */
interface Pane {
	/** Unique identifier for the pane (e.g., "sidebar", "properties", "users") */
	name: string;
	/** Whether the pane is currently visible */
	visible: boolean;
}

/**
 * Type definition for the Pane Context.
 * Contains an array of all panes and their current visibility state.
 */
interface PaneContextType {
	/** Array of all panes with their names and visibility state */
	panes: Pane[];
}

/**
 * React context for managing UI pane visibility throughout the application.
 * Provides a centralized way to track and manage which panes are currently visible.
 *
 * Default value has an empty panes array, which will be populated when the
 * PaneContext.Provider is used with actual pane data.
 */
export const PaneContext = createContext<PaneContextType>({
	panes: [],
});
