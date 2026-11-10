/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Unified Event Subscription Utilities
 *
 * This module provides a centralized system for managing event subscriptions
 * throughout the Fluid Framework demo app. It eliminates repetitive patterns
 * and provides consistent, type-safe event handling.
 *
 * Key Features:
 * - Unified subscription patterns for Fluid Framework events
 * - Automatic cleanup management
 * - Selection-based state synchronization helpers
 * - DOM event listener utilities with proper cleanup
 * - Type-safe event handling
 * - Performance optimized with minimal re-renders
 *
 * This utility consolidates patterns found across components like:
 * - Selection state synchronization
 * - Presence updates
 * - Tree commit events
 * - DOM pointer events
 */

import { useEffect, useCallback, useRef } from "react";
import { SelectionManager } from "../presence/Interfaces/SelectionManager.js";
import { TypedSelection } from "../presence/selection.js";

/**
 * Generic event subscription hook for Fluid Framework Listenable objects.
 * Handles subscription and automatic cleanup using a more flexible approach.
 *
 * @param eventSource - The object with an 'on' method for event subscription
 * @param eventName - Name of the event to subscribe to
 * @param handler - Event handler function
 * @param deps - Dependency array for when to re-subscribe
 */
export function useEventSubscription<
	T extends { on: (event: string, handler: (...args: unknown[]) => void) => () => void },
>(
	eventSource: T | undefined,
	eventName: string,
	handler: (...args: unknown[]) => void,
	deps: React.DependencyList = []
): void {
	useEffect(() => {
		if (!eventSource) return;

		const unsubscribe = eventSource.on(eventName, handler);
		return () => unsubscribe();
	}, [eventSource, eventName, ...deps]);
}

/**
 * Selection state synchronization hook for managing UI state based on selection changes.
 * This consolidates the repetitive pattern of subscribing to selection events and updating local state.
 *
 * @param selectionManager - The selection manager to subscribe to
 * @param stateUpdater - Function that receives current selections and updates state
 * @param deps - Additional dependencies for re-subscription
 */
export function useSelectionSync<TSelection extends { id: string; type?: string }>(
	selectionManager: SelectionManager<TSelection> | undefined,
	stateUpdater: (selections: readonly TSelection[]) => void,
	deps: React.DependencyList = []
): void {
	const stateUpdaterRef = useRef(stateUpdater);
	stateUpdaterRef.current = stateUpdater;

	useEffect(() => {
		if (!selectionManager) return;

		const handleSelectionUpdate = () => {
			const selections = selectionManager.getLocalSelection();
			stateUpdaterRef.current(selections);
		};

		// Initial state update
		handleSelectionUpdate();

		// Subscribe to changes
		const unsubscribe = selectionManager.events.on("localUpdated", handleSelectionUpdate);
		return () => unsubscribe();
	}, [selectionManager, ...deps]);
}

/**
 * Specialized hook for managing button disabled state based on selection criteria.
 * This consolidates the common pattern of enabling/disabling buttons based on selection.
 *
 * @param selectionManager - The selection manager to monitor
 * @param isValidSelection - Function that determines if current selection should enable the button
 * @param setDisabled - State setter for disabled state
 * @param deps - Additional dependencies
 */
export function useSelectionBasedButtonState<TSelection extends { id: string; type?: string }>(
	selectionManager: SelectionManager<TSelection> | undefined,
	isValidSelection: (selections: readonly TSelection[]) => boolean,
	setDisabled: (disabled: boolean) => void,
	deps: React.DependencyList = []
): void {
	const isValidSelectionRef = useRef(isValidSelection);
	const setDisabledRef = useRef(setDisabled);
	isValidSelectionRef.current = isValidSelection;
	setDisabledRef.current = setDisabled;

	useSelectionSync(
		selectionManager,
		useCallback((selections) => {
			const isValid = isValidSelectionRef.current(selections);
			setDisabledRef.current(!isValid);
		}, []),
		deps
	);
}

/**
 * Hook for managing DOM event listeners with automatic cleanup.
 * Handles the common pattern of adding event listeners and removing them on cleanup.
 *
 * @param target - The DOM target to attach listeners to (element, document, window)
 * @param eventType - The event type to listen for
 * @param handler - The event handler function
 * @param options - Event listener options
 * @param deps - Dependencies for when to re-attach listeners
 */
export function useDOMEventListener<K extends keyof GlobalEventHandlersEventMap>(
	target: EventTarget | null | undefined,
	eventType: K,
	handler: (event: GlobalEventHandlersEventMap[K]) => void,
	options?: AddEventListenerOptions,
	deps: React.DependencyList = []
): void {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!target) return;

		const eventHandler = (event: GlobalEventHandlersEventMap[K]) => {
			handlerRef.current(event);
		};

		target.addEventListener(eventType, eventHandler as EventListener, options);
		return () => {
			target.removeEventListener(eventType, eventHandler as EventListener, options);
		};
	}, [target, eventType, options, ...deps]);
}

/**
 * Hook for managing multiple DOM event listeners at once.
 * Useful for pointer events that need multiple listeners (move, up, cancel, etc.).
 *
 * @param target - The DOM target to attach listeners to
 * @param events - Array of event configurations
 * @param deps - Dependencies for when to re-attach listeners
 */
export function useMultipleDOMEventListeners(
	target: EventTarget | null | undefined,
	events: Array<{
		type: string;
		handler: (event: Event) => void;
		options?: AddEventListenerOptions;
	}>,
	deps: React.DependencyList = []
): void {
	const eventsRef = useRef(events);
	eventsRef.current = events;

	useEffect(() => {
		if (!target) return;

		const eventHandlers = eventsRef.current.map(({ type, handler, options }) => {
			const eventHandler = (event: Event) => handler(event);
			target.addEventListener(type, eventHandler, options);
			return { type, handler: eventHandler, options };
		});

		return () => {
			eventHandlers.forEach(({ type, handler, options }) => {
				target.removeEventListener(type, handler, options);
			});
		};
	}, [target, ...deps]);
}

/**
 * Hook for subscribing to tree commit events with state updates.
 * Consolidates the pattern of listening to tree changes and updating component state.
 *
 * @param tree - The SharedTree or tree-like object with events
 * @param onCommit - Callback function to execute on commit
 * @param deps - Dependencies for re-subscription
 */
export function useTreeCommitSubscription(
	tree: { events: { on: (event: string, handler: () => void) => () => void } } | undefined,
	onCommit: () => void,
	deps: React.DependencyList = []
): void {
	useEventSubscription(tree?.events, "commitApplied", onCommit, deps);
}

/**
 * Helper function to extract selections by type (commonly used pattern).
 * This consolidates the repetitive logic of filtering selections by type.
 *
 * @param selectionManager - The selection manager
 * @param type - The selection type to filter by
 * @returns Array of selections matching the type
 */
export function getSelectionsByType(
	selectionManager: SelectionManager<TypedSelection>,
	type: string
): TypedSelection[] {
	const selections = selectionManager.getLocalSelection();
	return selections.filter((sel) => sel.type === type);
}

/**
 * Hook for multi-type selection state management.
 * Handles the common pattern of managing multiple selection types (row, column, cell).
 *
 * @param selectionManager - The typed selection manager
 * @param stateUpdaters - Object mapping selection types to state updater functions
 * @param deps - Additional dependencies
 */
export function useMultiTypeSelectionSync(
	selectionManager: SelectionManager<TypedSelection> | undefined,
	stateUpdaters: Record<string, (selections: TypedSelection[]) => void>,
	deps: React.DependencyList = []
): void {
	const stateUpdatersRef = useRef(stateUpdaters);
	stateUpdatersRef.current = stateUpdaters;

	useSelectionSync(
		selectionManager,
		useCallback((selections) => {
			const updaters = stateUpdatersRef.current;

			// Group selections by type
			const selectionsByType: Record<string, TypedSelection[]> = {};
			for (const selection of selections) {
				const type = selection.type || "default";
				if (!selectionsByType[type]) {
					selectionsByType[type] = [];
				}
				selectionsByType[type].push(selection);
			}

			// Call appropriate updaters
			for (const [type, updater] of Object.entries(updaters)) {
				const selectionsForType = selectionsByType[type] || [];
				updater(selectionsForType);
			}
		}, []),
		deps
	);
}

/**
 * Convenience hook that combines common patterns for table button components.
 * Handles disabled state management based on selection criteria.
 *
 * @param selectionManager - The selection manager to monitor
 * @param requiredTypes - Array of selection types that should enable the button
 * @param setDisabled - State setter for disabled state
 * @param additionalCheck - Optional additional validation function
 */
export function useTableButtonState(
	selectionManager: SelectionManager<TypedSelection> | undefined,
	requiredTypes: string[],
	setDisabled: (disabled: boolean) => void,
	additionalCheck?: (selections: readonly TypedSelection[]) => boolean
): void {
	useSelectionBasedButtonState(
		selectionManager,
		(selections) => {
			const hasRequiredType = requiredTypes.some((type) =>
				selections.some((sel) => sel.type === type)
			);

			if (!hasRequiredType) return false;

			return additionalCheck ? additionalCheck(selections) : true;
		},
		setDisabled
	);
}
