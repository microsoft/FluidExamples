/**
 * Presence Manager Hook
 *
 * Custom React hook for managing real-time presence state changes in a Fluid Framework
 * application. This hook provides a convenient way to subscribe to presence events
 * and react to state changes from both local and remote clients.
 *
 * Key Features:
 * - Automatic subscription to presence state changes
 * - Separate handling for local vs remote updates
 * - Attendee disconnect event handling
 * - Automatic cleanup of event subscriptions
 * - Type-safe event handling with generics
 * - Flexible callback configuration
 *
 * The hook manages three types of events:
 * 1. Remote updates - when other users change their presence state
 * 2. Local updates - when the current user changes their presence state
 * 3. Disconnect events - when users leave the collaboration session
 *
 * This enables components to respond appropriately to different types of
 * collaborative changes and maintain an up-to-date view of the shared state.
 */

import { useEffect } from "react";
import { PresenceManager } from "../../presence/Interfaces/PresenceManager.js";
import { Attendee } from "@fluidframework/presence/alpha";

/**
 * Custom hook to manage presence state changes in a Fluid Framework application.
 * Subscribes to presence events and executes callbacks when state changes occur.
 *
 * @template TState - The type of presence state being managed
 * @param presenceManager - The presence manager instance to subscribe to
 * @param runOnChange - Callback function to execute when remote presence state changes
 * @param runOnChangeLocal - Callback function for local state changes (defaults to runOnChange)
 * @param runOnDisconnect - Optional callback for when attendees disconnect
 *
 * Features:
 * - Automatically subscribes to presence events on mount
 * - Cleans up subscriptions on unmount or dependency changes
 * - Handles both local and remote state changes separately
 * - Provides disconnect event handling for cleanup operations
 *
 * Usage example:
 * ```tsx
 * const selectionManager = useContext(PresenceContext).itemSelection;
 *
 * usePresenceManager(
 *   selectionManager,
 *   (remoteSelection) => {
 *     // Handle remote user selection changes
 *     updateUI(remoteSelection);
 *   },
 *   (localSelection) => {
 *     // Handle local selection changes
 *     updateLocalState(localSelection);
 *   },
 *   (disconnectedUser) => {
 *     // Clean up resources for disconnected user
 *     removeUserIndicators(disconnectedUser.attendeeId);
 *   }
 * );
 * ```
 */
export function usePresenceManager<TState>(
	presenceManager: PresenceManager<TState>,
	runOnChange: (updated: TState) => void,
	runOnChangeLocal: (updated: TState) => void = runOnChange,
	runOnDisconnect?: (updated: Attendee) => void
) {
	/**
	 * Subscribe to remote presence state updates.
	 * Triggered when other users change their presence state.
	 */
	useEffect(() => {
		const unsubscribe = presenceManager.events.on("remoteUpdated", (updated) => {
			runOnChange(updated.value as TState);
		});
		return unsubscribe;
	}, [presenceManager, runOnChange]);

	/**
	 * Subscribe to local presence state updates.
	 * Triggered when the current user changes their presence state.
	 * Uses a separate callback to allow different handling of local vs remote changes.
	 */
	useEffect(() => {
		const unsubscribe = presenceManager.events.on("localUpdated", (updated) => {
			runOnChangeLocal(updated.value as TState);
		});
		return unsubscribe;
	}, [presenceManager, runOnChangeLocal]);

	/**
	 * Subscribe to attendee disconnect events.
	 * Triggered when users leave the collaboration session.
	 * Only subscribes if a disconnect callback is provided.
	 */
	useEffect(() => {
		if (!runOnDisconnect) {
			return;
		}

		const unsubscribe = presenceManager.attendees.events.on(
			"attendeeDisconnected",
			(updated) => {
				runOnDisconnect(updated);
			}
		);
		return unsubscribe;
	}, [presenceManager, runOnDisconnect]);
}
