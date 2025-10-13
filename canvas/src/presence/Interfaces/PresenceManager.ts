/**
 * PresenceManager Interfaces
 *
 * Core interfaces for managing real-time presence data in the Fluid Framework demo app.
 * These interfaces provide the foundation for all collaborative features including:
 * - User presence and status
 * - Real-time state synchronization
 * - Multi-client coordination
 * - Event-driven updates
 */

import {
	Latest,
	LatestEvents,
	LatestMap,
	LatestMapEvents,
	AttendeesEvents,
	Attendee,
	AttendeeId,
	ClientConnectionId,
} from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";

/**
 * PresenceManager interface for managing real-time state synchronization.
 * Provides a unified way to manage presence data across all connected clients.
 *
 * @template TState - The type of state being managed (e.g., selection, drag, resize)
 */
export interface PresenceManager<TState> {
	/** The current state wrapped in Fluid's Latest for real-time sync with validation */
	state: Latest<TState>;

	/** Interface for managing client connections and attendees
	 * Provides methods to get attendees, their details, and the current user.
	 */
	attendees: {
		readonly events: Listenable<AttendeesEvents>;
		getAttendees(): ReadonlySet<Attendee>;
		getAttendee(clientId: ClientConnectionId | AttendeeId): Attendee;
		getMyself(): Attendee;
	};

	/** Event emitter for state change notifications */
	events: Listenable<LatestEvents<TState>>;
}

/**
 * PresenceMapManager interface for managing map-based presence data.
 * Used when state needs to be organized by keys (e.g., user-specific states).
 *
 * @template TState - The type of state being managed
 */
export interface PresenceMapManager<TState> {
	/** The current map state wrapped in Fluid's LatestMap for real-time sync with validation */
	state: LatestMap<TState>;

	/** Interface for managing client connections and attendees */
	attendees: {
		readonly events: Listenable<AttendeesEvents>;
		getAttendees(): ReadonlySet<Attendee>;
		getAttendee(clientId: ClientConnectionId | AttendeeId): Attendee;
		getMyself(): Attendee;
	};

	/** Event emitter for map state change notifications */
	events: Listenable<LatestMapEvents<TState, string>>;
}
