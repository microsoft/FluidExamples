/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Keyboard Shortcuts Hook
 *
 * Generic React hook for managing keyboard shortcuts throughout the application.
 * This hook provides a declarative way to register keyboard shortcuts with
 * proper event handling, modifier key support, and context-aware filtering.
 *
 * Key Features:
 * - Declarative shortcut registration using configuration objects
 * - Support for all modifier keys (Ctrl, Shift, Alt, Meta/Cmd)
 * - Automatic filtering to prevent shortcuts in input fields
 * - Enable/disable functionality for conditional shortcut activation
 * - Disabled state support for individual shortcuts
 * - Proper event handling and cleanup
 * - Cross-platform compatibility (Ctrl/Cmd handling)
 *
 * The hook automatically prevents shortcut activation when users are typing
 * in input fields, textareas, or contentEditable elements to avoid conflicts
 * with normal text input.
 */

import { useEffect } from "react";

/**
 * Configuration object for a single keyboard shortcut.
 * Defines the key combination and action to perform.
 */
export interface KeyboardShortcut {
	/** The primary key to trigger the shortcut (e.g., "z", "s", "Enter") */
	key: string;

	/** Whether Ctrl key must be pressed (Cmd on Mac) */
	ctrlKey?: boolean;

	/** Whether Shift key must be pressed */
	shiftKey?: boolean;

	/** Whether Alt key must be pressed (Option on Mac) */
	altKey?: boolean;

	/** Whether Meta key must be pressed (Cmd on Mac, Windows key on PC) */
	metaKey?: boolean;

	/** Function to execute when the shortcut is triggered */
	action: () => void;

	/** Whether this specific shortcut is currently disabled */
	disabled?: boolean;
}

/**
 * Props interface for the useKeyboardShortcuts hook.
 */
export interface UseKeyboardShortcutsProps {
	/** Array of keyboard shortcuts to register and monitor */
	shortcuts: KeyboardShortcut[];

	/** Whether the shortcuts system is enabled (default: true) */
	enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts in the application.
 * Registers event listeners and manages shortcut execution with proper filtering.
 *
 * @param props - Configuration object for the shortcuts
 * @param props.shortcuts - Array of keyboard shortcuts to register
 * @param props.enabled - Whether shortcuts are enabled (default: true)
 *
 * Features:
 * - Automatically prevents shortcuts when typing in input fields
 * - Supports all modifier key combinations
 * - Handles disabled shortcuts gracefully
 * - Prevents default browser behavior for registered shortcuts
 * - Provides proper cleanup on unmount
 *
 * Usage example:
 * ```tsx
 * const shortcuts = [
 *   { key: "s", ctrlKey: true, action: () => save() },
 *   { key: "z", ctrlKey: true, action: () => undo(), disabled: !canUndo },
 * ];
 *
 * useKeyboardShortcuts({ shortcuts, enabled: true });
 * ```
 */
export function useKeyboardShortcuts({
	shortcuts,
	enabled = true,
}: UseKeyboardShortcutsProps): void {
	useEffect(() => {
		// Early return if shortcuts are disabled
		if (!enabled) {
			return;
		}

		/**
		 * Handles keydown events and triggers matching shortcuts.
		 * Includes filtering to prevent shortcuts in input contexts.
		 */
		const handleKeyDown = (event: KeyboardEvent): void => {
			// Don't trigger shortcuts when user is typing in an input field
			// This prevents conflicts with normal text input operations
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true"
			) {
				return;
			}

			// Find the first matching shortcut based on key combination
			const matchingShortcut = shortcuts.find((shortcut) => {
				// Skip disabled shortcuts
				if (shortcut.disabled) {
					return false;
				}

				// Match the key and all required modifier keys
				// Using !! to normalize boolean values for comparison
				return (
					event.key.toLowerCase() === shortcut.key.toLowerCase() &&
					!!event.ctrlKey === !!shortcut.ctrlKey &&
					!!event.shiftKey === !!shortcut.shiftKey &&
					!!event.altKey === !!shortcut.altKey &&
					!!event.metaKey === !!shortcut.metaKey
				);
			});

			// If a matching shortcut is found, prevent default behavior and execute it
			if (matchingShortcut) {
				event.preventDefault(); // Prevent browser default (e.g., Ctrl+S save dialog)
				event.stopPropagation(); // Prevent event bubbling
				matchingShortcut.action(); // Execute the shortcut action
			}
		};

		// Register the keydown event listener
		document.addEventListener("keydown", handleKeyDown);

		// Cleanup function to remove event listener on unmount or dependency change
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [shortcuts, enabled]);
}

/**
 * Utility function to format a keyboard shortcut for display in UI elements.
 * Converts a shortcut configuration into a human-readable string for tooltips,
 * help text, or keyboard shortcut displays.
 *
 * @param shortcut - The keyboard shortcut configuration (without action/disabled)
 * @returns Formatted string representation (e.g., "Ctrl+Z", "Shift+Delete", "Alt+F4")
 *
 * Examples:
 * - { key: "z", ctrlKey: true } → "Ctrl+Z"
 * - { key: "Delete", shiftKey: true } → "Shift+Delete"
 * - { key: "s", ctrlKey: true, shiftKey: true } → "Ctrl+Shift+S"
 */
export function formatKeyboardShortcut(
	shortcut: Omit<KeyboardShortcut, "action" | "disabled">
): string {
	const parts: string[] = [];

	// Add modifier keys in standard order
	if (shortcut.ctrlKey) parts.push("Ctrl");
	if (shortcut.metaKey) parts.push("Cmd");
	if (shortcut.altKey) parts.push("Alt");
	if (shortcut.shiftKey) parts.push("Shift");

	// Format the main key: capitalize single letters, keep special keys as-is
	const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
	parts.push(key);

	// Join with + separator
	return parts.join("+");
}
