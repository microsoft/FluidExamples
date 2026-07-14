/**
 * App Keyboard Shortcuts Hook
 * (Clean header restored; adds viewport centering for new items.)
 */

import { TreeView, Tree } from "fluid-framework";
import { App, FluidTable } from "../../schema/appSchema.js";
import { KeyboardShortcut } from "./useKeyboardShortcuts.js";
import { undoRedo } from "../../undo/undo.js";
import { UsersManager } from "../../presence/Interfaces/UsersManager.js";
import { SelectionManager } from "../../presence/Interfaces/SelectionManager.js";
import { SHAPE_COLORS } from "../components/toolbar/buttons/CreationButtons.js";
import { findItemById, findItemsByIds, getAllItems } from "../../utils/itemsHelpers.js";
import { centerLastItem } from "../../utils/centerItem.js";

/**
 * Props interface for the useAppKeyboardShortcuts hook.
 * Contains all the dependencies needed for keyboard shortcut operations.
 */
export interface UseAppKeyboardShortcutsProps {
	view: TreeView<typeof App>;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
	shapeColor?: string;
	selectedItemId: string;
	selectedItemIds: string[];
	selectedColumnId: string;
	selectedRowId: string;
	commentPaneHidden: boolean;
	undoRedo: undoRedo;
	users: UsersManager;
	canUndo: boolean;
	canRedo: boolean;
	setCommentPaneHidden: (hidden: boolean) => void;
	openCommentPaneAndFocus: (itemId: string) => void;
	selectionManager: SelectionManager;
}

/**
 * Custom hook that returns all keyboard shortcuts for the ReactApp component.
 * Provides a comprehensive set of keyboard shortcuts for productivity and accessibility.
 *
 * @param props - Configuration object containing all dependencies for shortcuts
 * @returns Array of KeyboardShortcut objects defining all available shortcuts
 *
 * Keyboard Shortcuts:
 * - Ctrl+Z: Undo last operation
 * - Ctrl+Y / Ctrl+Shift+Z: Redo last undone operation
 * - C: Create circle shape
 * - S: Create square shape
 * - T: Create triangle shape
 * - R: Create star shape
 * - N: Create note item
 * - B: Create table
 * - A: Select all items
 * - Delete: Delete selected items
 * - 1-9: Apply color to selected shapes
 * - M: Toggle comment pane visibility
 * - Enter: Add comment to selected item
 * - Escape: Clear all selections
 * - Arrow keys: Navigate table selections
 */
export function useAppKeyboardShortcuts(props: UseAppKeyboardShortcutsProps): KeyboardShortcut[] {
	const {
		view,
		canvasSize,
		selectedItemIds,
		selectedColumnId,
		selectedRowId,
		commentPaneHidden,
		undoRedo,
		users,
		canUndo,
		canRedo,
		setCommentPaneHidden,
		openCommentPaneAndFocus,
		selectionManager,
		pan,
		zoom,
		shapeColor,
	} = props;

	return [
		// Undo/Redo shortcuts - Essential for collaborative editing
		{
			key: "z",
			ctrlKey: true,
			action: () => undoRedo.undo(),
			disabled: !canUndo,
		},
		{
			key: "y",
			ctrlKey: true,
			action: () => undoRedo.redo(),
			disabled: !canRedo,
		},
		{
			key: "z",
			ctrlKey: true,
			shiftKey: true,
			action: () => undoRedo.redo(),
			disabled: !canRedo,
		},
		// Shape creation shortcuts
		{
			key: "c",
			action: () => {
				// Use the specific color or fallback to random selection (same logic as buttons)
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				view.root.items.createShapeItem("circle", canvasSize, colors);
				centerLastItem(view.root.items, pan, zoom, props.canvasSize, 120, 120, true);
			},
		},
		{
			key: "s",
			action: () => {
				// Use the specific color or fallback to random selection (same logic as buttons)
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				view.root.items.createShapeItem("square", canvasSize, colors);
				centerLastItem(view.root.items, pan, zoom, props.canvasSize, 120, 120, true);
			},
		},
		{
			key: "t",
			action: () => {
				// Use the specific color or fallback to random selection (same logic as buttons)
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				view.root.items.createShapeItem("triangle", canvasSize, colors);
				centerLastItem(view.root.items, pan, zoom, props.canvasSize, 120, 120, true);
			},
		},
		{
			key: "r",
			action: () => {
				// Use the specific color or fallback to random selection (same logic as buttons)
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				view.root.items.createShapeItem("star", canvasSize, colors);
				centerLastItem(view.root.items, pan, zoom, props.canvasSize, 120, 120, true);
			},
		},
		{
			key: "n",
			action: () => {
				view.root.items.createNoteItem(canvasSize, users.getMyself().value.id);
				centerLastItem(view.root.items, pan, zoom, props.canvasSize, 180, 120, true);
			},
		},
		{
			key: "b",
			action: () => {
				view.root.items.createTableItem(canvasSize);
				centerLastItem(view.root.items, pan, zoom, props.canvasSize, 240, 160, true);
			},
		},
		// Selected item shortcuts
		{
			key: "Delete",
			action: () => {
				// Delete all selected items in a transaction
				Tree.runTransaction(view.root.items, () => {
					selectedItemIds.forEach((itemId) => {
						const selectedItem = findItemById(view.root.items, itemId);
						if (selectedItem) {
							selectedItem.delete();
						}
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		{
			key: "d",
			ctrlKey: true,
			action: () => {
				// Duplicate all selected items in a transaction
				Tree.runTransaction(view.root.items, () => {
					// First collect all the items to duplicate to avoid issues with array modification during iteration
					const itemsToDuplicate = findItemsByIds(view.root.items, selectedItemIds);

					// Then duplicate each item
					itemsToDuplicate.forEach((selectedItem) => {
						view.root.items.duplicateItem(selectedItem, canvasSize);
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		// Z-order shortcuts
		{
			key: "[", // [
			action: () => {
				// Move all selected items backward in a transaction
				Tree.runTransaction(view.root.items, () => {
					selectedItemIds.forEach((itemId) => {
						const selectedItem = findItemById(view.root.items, itemId);
						if (selectedItem) {
							view.root.items.moveItemBackward(selectedItem);
						}
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		{
			key: "]", // ]
			action: () => {
				// Move all selected items forward in a transaction
				Tree.runTransaction(view.root.items, () => {
					selectedItemIds.forEach((itemId) => {
						const selectedItem = findItemById(view.root.items, itemId);
						if (selectedItem) {
							view.root.items.moveItemForward(selectedItem);
						}
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		{
			key: "[", // Ctrl+[
			ctrlKey: true,
			action: () => {
				// Send all selected items to back in a transaction
				Tree.runTransaction(view.root.items, () => {
					selectedItemIds.forEach((itemId) => {
						const selectedItem = findItemById(view.root.items, itemId);
						if (selectedItem) {
							view.root.items.sendItemToBack(selectedItem);
						}
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		{
			key: "]", // Ctrl+]
			ctrlKey: true,
			action: () => {
				// Bring all selected items to front in a transaction
				Tree.runTransaction(view.root.items, () => {
					selectedItemIds.forEach((itemId) => {
						const selectedItem = findItemById(view.root.items, itemId);
						if (selectedItem) {
							view.root.items.bringItemToFront(selectedItem);
						}
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		// Clear all shortcut
		{
			key: "Delete",
			ctrlKey: true,
			shiftKey: true,
			action: () => view.root.items.removeRange(),
			disabled: view.root.items.length === 0,
		},
		// Select All shortcut
		{
			key: "a",
			ctrlKey: true,
			action: () => {
				const allSelections = getAllItems(view.root.items).map((item) => ({ id: item.id }));
				selectionManager.setSelection(allSelections);
			},
			disabled: view.root.items.length === 0,
		},
		// Clear selection shortcut
		{
			key: "Escape",
			action: () => {
				selectionManager.clearSelection();
			},
			disabled: selectedItemIds.length === 0,
		},
		// Toggle comment pane
		{
			key: "m",
			ctrlKey: true,
			action: () => setCommentPaneHidden(!commentPaneHidden),
		},
		// Vote shortcut
		{
			key: "v",
			action: () => {
				const userId = users.getMyself().value.id;
				// Vote on all selected items in a transaction
				Tree.runTransaction(view.root, () => {
					selectedItemIds.forEach((itemId) => {
						const selectedItem = findItemById(view.root.items, itemId);
						if (selectedItem) {
							selectedItem.votes.toggleVote(userId);
						}
					});
				});
			},
			disabled: selectedItemIds.length === 0,
		},
		// Comment shortcut
		{
			key: "/",
			ctrlKey: true,
			action: () => {
				// Comment on the first selected item
				if (selectedItemIds.length > 0) {
					const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
					if (selectedItem) {
						openCommentPaneAndFocus(selectedItem.id);
					}
				}
			},
			disabled: selectedItemIds.length === 0,
		},
		// Table operation shortcuts (only work when a table is selected)
		{
			key: "c",
			ctrlKey: true,
			shiftKey: true,
			action: () => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (selectedItem && Tree.is(selectedItem.content, FluidTable)) {
					const table = selectedItem.content as FluidTable;
					table.addColumn();
				}
			},
			disabled: (() => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				return !selectedItem || !Tree.is(selectedItem.content, FluidTable);
			})(),
		},
		{
			key: "r",
			ctrlKey: true,
			shiftKey: true,
			action: () => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (selectedItem && Tree.is(selectedItem.content, FluidTable)) {
					const table = selectedItem.content as FluidTable;
					table.addRow();
				}
			},
			disabled: (() => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				return !selectedItem || !Tree.is(selectedItem.content, FluidTable);
			})(),
		},
		{
			key: "ArrowLeft",
			ctrlKey: true,
			shiftKey: true,
			action: () => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedColumnId) {
					const table = selectedItem.content as FluidTable;
					const selectedColumn = table.columns.find((col) => col.id === selectedColumnId);
					if (selectedColumn) {
						table.moveColumnLeft(selectedColumn);
					}
				}
			},
			disabled: (() => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (
					!(selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedColumnId)
				) {
					return true;
				}
				const table = selectedItem.content as FluidTable;
				const selectedColumn = table.columns.find((col) => col.id === selectedColumnId);
				if (!selectedColumn) return true;
				const currentIndex = table.columns.indexOf(selectedColumn);
				return currentIndex === 0;
			})(),
		},
		{
			key: "ArrowRight",
			ctrlKey: true,
			shiftKey: true,
			action: () => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedColumnId) {
					const table = selectedItem.content as FluidTable;
					const selectedColumn = table.columns.find((col) => col.id === selectedColumnId);
					if (selectedColumn) {
						table.moveColumnRight(selectedColumn);
					}
				}
			},
			disabled: (() => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (
					!(selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedColumnId)
				) {
					return true;
				}
				const table = selectedItem.content as FluidTable;
				const selectedColumn = table.columns.find((col) => col.id === selectedColumnId);
				if (!selectedColumn) return true;
				const currentIndex = table.columns.indexOf(selectedColumn);
				return currentIndex >= table.columns.length - 1;
			})(),
		},
		{
			key: "ArrowUp",
			ctrlKey: true,
			shiftKey: true,
			action: () => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedRowId) {
					const table = selectedItem.content as FluidTable;
					const selectedRow = table.rows.find((row) => row.id === selectedRowId);
					if (selectedRow) {
						table.moveRowUp(selectedRow);
					}
				}
			},
			disabled: (() => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (!(selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedRowId)) {
					return true;
				}
				const table = selectedItem.content as FluidTable;
				const selectedRow = table.rows.find((row) => row.id === selectedRowId);
				if (!selectedRow) return true;
				const currentIndex = table.rows.indexOf(selectedRow);
				return currentIndex === 0;
			})(),
		},
		{
			key: "ArrowDown",
			ctrlKey: true,
			shiftKey: true,
			action: () => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedRowId) {
					const table = selectedItem.content as FluidTable;
					const selectedRow = table.rows.find((row) => row.id === selectedRowId);
					if (selectedRow) {
						table.moveRowDown(selectedRow);
					}
				}
			},
			disabled: (() => {
				const selectedItem = findItemById(view.root.items, selectedItemIds[0]);
				if (!(selectedItem && Tree.is(selectedItem.content, FluidTable) && selectedRowId)) {
					return true;
				}
				const table = selectedItem.content as FluidTable;
				const selectedRow = table.rows.find((row) => row.id === selectedRowId);
				if (!selectedRow) return true;
				const currentIndex = table.rows.indexOf(selectedRow);
				return currentIndex >= table.rows.length - 1;
			})(),
		},
	];
}
