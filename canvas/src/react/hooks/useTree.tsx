/**
 * Tree Hook
 *
 * Custom React hook for monitoring Fluid Framework tree state changes and
 * triggering React re-renders when the tree structure or node data changes.
 * This hook is essential for keeping React components synchronized with
 * the collaborative tree data structure.
 *
 * Key Features:
 * - Automatic subscription to tree change events
 * - Support for both shallow (nodeChanged) and deep (treeChanged) monitoring
 * - Efficient re-render triggering using invalidation counter
 * - Automatic cleanup of event subscriptions
 * - Object identity mapping for React keys
 * - WeakMap-based object ID generation for performance
 *
 * The hook uses an invalidation counter that increments whenever the tree
 * changes, causing React to re-render components that depend on the tree state.
 * This provides a efficient way to keep the UI synchronized with the
 * collaborative data without manual event handling.
 */

import { useEffect, useState } from "react";
import { Tree } from "fluid-framework";
import { TreeNode } from "@fluidframework/tree/alpha";

/**
 * Custom hook to monitor Fluid Framework tree state changes and trigger React re-renders.
 * Subscribes to tree change events and increments an invalidation counter to force updates.
 *
 * @param node - The TreeNode to monitor for changes
 * @param deep - Whether to monitor deep changes (treeChanged) or shallow changes (nodeChanged)
 * @returns Invalidation counter that increments on each tree change
 *
 * Event Types:
 * - nodeChanged: Fired when the specific node's properties change
 * - treeChanged: Fired when any part of the tree structure changes (including descendants)
 *
 * Usage example:
 * ```tsx
 * const MyComponent = ({ treeNode }) => {
 *   // Re-render when the node or its descendants change
 *   const treeVersion = useTree(treeNode, true);
 *
 *   return <div>Tree version: {treeVersion}</div>;
 * };
 * ```
 *
 * Performance considerations:
 * - Use deep=false for better performance when only immediate node changes matter
 * - Use deep=true when you need to monitor changes in the entire subtree
 * - The invalidation counter ensures minimal re-renders (only when actual changes occur)
 */
export function useTree(node: TreeNode, deep: boolean = false): number {
	/** Invalidation counter that increments on each tree change */
	const [inval, setInval] = useState(0);

	useEffect(() => {
		// Subscribe to the appropriate tree change event based on the deep parameter
		const eventType = deep ? "treeChanged" : "nodeChanged";

		const unsubscribe = Tree.on(node, eventType, () => {
			// Increment the invalidation counter to trigger a re-render
			setInval((prev) => prev + 1);
		});

		// Clean up the subscription when the component unmounts or dependencies change
		return unsubscribe;
	}, [node, deep]);

	return inval;
}

/** Global counter for generating unique object IDs */
let counter = 0;

/** WeakMap for associating unique IDs with objects (automatically garbage collected) */
const idMap = new WeakMap<object, number>();

/**
 * Associates a unique number with an object for use as React keys or other identity purposes.
 * The ID is tied to object identity, not content - modifying the object won't change its ID.
 *
 * @param object - The object to get a unique ID for
 * @returns A unique number associated with the object
 *
 * Key Features:
 * - Object identity-based (not content-based) ID generation
 * - Automatic garbage collection via WeakMap
 * - Consistent IDs for the same object across multiple calls
 * - Performance optimized with caching
 *
 * Use Cases:
 * - Generating React keys for TreeNode objects in lists
 * - Creating stable identifiers for objects that can't be used directly as keys
 * - Performance optimization when object identity matters but objects can't be used directly
 *
 * Example:
 * ```tsx
 * const items = treeNode.children;
 * return (
 *   <ul>
 *     {items.map(item => (
 *       <li key={objectIdNumber(item)}>
 *         {item.value}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 *
 * @remarks
 * Most cases should use objects themselves instead of IDs for better performance.
 * This function exists for edge cases like React keys where objects can't be used directly.
 */
export function objectIdNumber(object: object): number {
	// Check if we already have an ID for this object
	const existingId = idMap.get(object);
	if (existingId !== undefined) {
		return existingId;
	}

	// Generate a new unique ID and cache it
	counter++;
	idMap.set(object, counter);
	return counter;
}
