import { Latest, LatestEvents } from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { EphemeralInkStroke, EphemeralPoint } from "../validators.js";

/**
 * Ephemeral ink presence model
 * --------------------------------------------
 * This interface layer describes how active (in‑progress) ink strokes are
 * exchanged between collaborators without persisting them to SharedTree.
 *
 * Life cycle:
 * 1. Local user begins drawing -> call setStroke() with initial single point.
 * 2. Subsequent pointer moves -> call updateStroke() with the full cumulative point list
 *    (manager is free to diff/optimize under the hood before emitting a signal).
 * 3. Pointer up / cancel -> call clearStroke() which clears local ephemeral state and
 *    notifies others to remove the preview path for this attendee.
 * 4. The committed stroke is written separately to the persistent tree (see canvas component).
 *
 * Each remote attendee can have at most one active ephemeral stroke. Consumers typically
 * render it semi‑transparent beneath persisted ink to give immediate feedback before commit.
 *
 * CURRENT IMPLEMENTATION LIMITATIONS:
 * -----------------------------------
 * The current approach has a significant limitation: the entire ink stroke (all points)
 * is sent with every presence message during drawing. This means that as a stroke gets
 * longer, each update message becomes progressively larger, potentially impacting
 * performance and network efficiency.
 *
 * Alternative approaches with smaller payloads (e.g., sending only incremental point
 * deltas) would likely lead to a choppy, degraded experience on remote clients because:
 * - Message delivery order is not guaranteed in presence signals
 * - Late-joining users would miss earlier stroke segments
 * - Network latency variations could cause visual artifacts
 * - Message loss could create permanent gaps in strokes
 *
 * The current "full stroke" approach ensures:
 * - Consistent visual experience across all clients
 * - Immediate complete stroke rendering for late joiners
 * - Resilience to message loss (next update contains full state)
 * - Smooth visual experience despite network variations
 *
 * FUTURE ENHANCEMENTS:
 * -------------------
 * There are plans to augment the Presence API in future versions to better handle
 * these incremental data cases.
 *
 * Until these enhancements are available, the current full-stroke approach provides
 * the best balance of performance and user experience reliability.
 */

/**
 * High-level manager contract exposed by PresenceContext for ink.
 * Mirrors other presence managers (selection, drag, etc.) for consistency.
 */
export interface InkPresenceManager {
	state: Latest<EphemeralInkStroke | null>;
	events: Listenable<LatestEvents<EphemeralInkStroke | null>>;
	attendees: Latest<EphemeralInkStroke | null>["presence"]["attendees"];
	/** Begin a new ephemeral stroke for the local user. */
	setStroke(stroke: EphemeralInkStroke): void;
	/** Replace the point list of the in‑progress local stroke (cumulative list). */
	updateStroke(points: EphemeralPoint[]): void;
	/** Clear the local stroke (on commit or cancel). */
	clearStroke(): void;
	/** Snapshot of all remote attendees currently broadcasting ink. */
	getRemoteStrokes(): { stroke: EphemeralInkStroke; attendeeId: string }[];
}
