import { PresenceManager } from "./PresenceManager.js";

/**
 * SelectionManager Interface
 *
 * This interface manages collaborative selection state across multiple clients in a Fluid Framework application.
 * It extends PresenceManager to provide selection-specific functionality for tracking which items are selected
 * by different users in real-time collaboration scenarios.
 *
 * Key Features:
 * - Multi-user selection tracking (who has what selected)
 * - Local vs remote selection differentiation
 * - Support for single and multi-selection modes
 * - Real-time synchronization across all connected clients
 *
 * Use Cases:
 * - Canvas item selection (shapes, notes, etc.)
 * - Table row/column selection
 * - Multi-user editing with visual selection indicators
 *
 * @template TSelection - The type of items being selected, must have an 'id' property
 */
export interface SelectionManager<TSelection extends Selection = Selection>
	extends PresenceManager<TSelection[]> {
	/**
	 * Checks if a specific item is currently selected by the local client
	 *
	 * This is useful for UI updates like highlighting selected items or
	 * enabling/disabling context menu options based on selection state.
	 *
	 * @param sel - The selection object to test (must have an 'id' property)
	 * @returns True if the item is selected by the current user, false otherwise
	 *
	 * @example
	 * if (selectionManager.testSelection({id: 'item1', type: 'shape'})) {
	 *   // Show selection highlight
	 * }
	 */
	testSelection(sel: TSelection): boolean;

	/**
	 * Identifies which remote clients have a specific item selected
	 *
	 * This enables showing collaborative selection indicators (e.g., colored borders
	 * around items selected by other users) to provide visual feedback about
	 * what other users are working on.
	 *
	 * @param sel - The selection object to test
	 * @returns Array of client IDs that have this item selected (empty if none)
	 *
	 * @example
	 * const remoteClients = selectionManager.testRemoteSelection({id: 'item1'});
	 * remoteClients.forEach(clientId => {
	 *   // Show colored border for each remote user
	 * });
	 */
	testRemoteSelection(sel: TSelection): string[];

	/**
	 * Clears all current selections for the local client
	 *
	 * This deselects everything and notifies other clients that this user
	 * no longer has anything selected. Useful for "click in empty space"
	 * behavior or reset operations.
	 *
	 * @example
	 * // User clicked on empty canvas area
	 * selectionManager.clearSelection();
	 */
	clearSelection(): void;

	/**
	 * Sets the selection to specific item(s), replacing any existing selection
	 *
	 * This is a complete replacement operation - any previously selected items
	 * will be deselected. Use addToSelection() or toggleSelection() if you want
	 * to preserve existing selections.
	 *
	 * @param sel - Single item or array of items to select
	 *
	 * @example
	 * // Single selection (replaces current selection)
	 * selectionManager.setSelection({id: 'item1', type: 'shape'});
	 *
	 * // Multi-selection (replaces current selection with these items)
	 * selectionManager.setSelection([
	 *   {id: 'item1', type: 'shape'},
	 *   {id: 'item2', type: 'shape'}
	 * ]);
	 */
	setSelection(sel: TSelection | TSelection[]): void;
	/**
	 * Toggles the selection state of a specific item
	 *
	 * If the item is currently selected, it will be deselected.
	 * If the item is not selected, it will be added to the selection.
	 * This preserves other selected items, making it ideal for Ctrl+click behavior.
	 *
	 * @param sel - The selection object to toggle
	 *
	 * @example
	 * // Ctrl+click behavior: toggle item without affecting others
	 * selectionManager.toggleSelection({id: 'item1', type: 'shape'});
	 */
	toggleSelection(sel: TSelection): void;

	/**
	 * Adds an item to the current selection without removing existing selections
	 *
	 * This is additive - existing selections are preserved. Useful for building
	 * up multi-selections programmatically or for Shift+click range selection.
	 *
	 * @param sel - The selection object to add
	 *
	 * @example
	 * // Add to existing selection (Shift+click behavior)
	 * selectionManager.addToSelection({id: 'item2', type: 'shape'});
	 */
	addToSelection(sel: TSelection): void;

	/**
	 * Removes a specific item from the current selection
	 *
	 * Other selected items remain selected. Useful for programmatically
	 * deselecting specific items without clearing the entire selection.
	 *
	 * @param sel - The selection object to remove
	 *
	 * @example
	 * // Remove specific item while keeping others selected
	 * selectionManager.removeFromSelection({id: 'item1', type: 'shape'});
	 */
	removeFromSelection(sel: TSelection): void;

	/**
	 * Gets the current local selection as a readonly array
	 *
	 * Returns all items currently selected by the local client. The array is
	 * readonly to prevent accidental mutations - use the selection methods
	 * to modify selections instead.
	 *
	 * @returns Readonly array of currently selected items
	 *
	 * @example
	 * const selected = selectionManager.getLocalSelection();
	 * console.log(`${selected.length} items selected`);
	 * selected.forEach(item => console.log(`Selected: ${item.id}`));
	 */
	getLocalSelection(): readonly TSelection[];

	/**
	 * Gets a map of all items selected by remote clients
	 *
	 * The map key is the selected item, and the value is an array of client IDs
	 * that have that item selected. This is useful for rendering collaborative
	 * selection indicators showing which users have which items selected.
	 *
	 * @returns Map where keys are selected items and values are arrays of client IDs
	 *
	 * @example
	 * const remoteSelections = selectionManager.getRemoteSelected();
	 * remoteSelections.forEach((clientIds, item) => {
	 *   console.log(`Item ${item.id} selected by: ${clientIds.join(', ')}`);
	 *   // Render colored borders for each client
	 * });
	 */
	getRemoteSelected(): Map<TSelection, string[]>;
}

/**
 * Base Selection Type
 *
 * The minimum required structure for any selectable item. All selection objects
 * must have a unique 'id' property that identifies them across the application.
 *
 * Custom selection types can extend this to add additional properties:
 *
 * @example
 * type ShapeSelection = Selection & {
 *   type: 'circle' | 'rectangle' | 'line';
 *   layer: number;
 * }
 */
export type Selection = {
	/** Unique identifier for the selectable item */
	id: string;
};
