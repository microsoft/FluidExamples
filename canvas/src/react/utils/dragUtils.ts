import { PresenceContext } from "../contexts/PresenceContext.js";

/**
 * Get the active drag/rotate state for an item from presence (local preferred, then any connected remote).
 * Returns null if no active drag for the item.
 */
export function getActiveDragForItem(
	presence: React.ContextType<typeof PresenceContext>,
	itemId: string
): { id: string; x: number; y: number; rotation: number } | null {
	const local = presence.drag?.state?.local as {
		id: string;
		x: number;
		y: number;
		rotation: number;
	} | null;
	if (local && local.id === itemId) return local;
	const remotesIter = (
		presence.drag?.state as unknown as { getRemotes?: () => unknown }
	)?.getRemotes?.();
	const isIterable = (obj: unknown): obj is Iterable<unknown> => {
		return !!obj && typeof (obj as { [k: symbol]: unknown })[Symbol.iterator] === "function";
	};
	const isRecord = (v: unknown): v is Record<string, unknown> =>
		typeof v === "object" && v !== null;
	if (isIterable(remotesIter)) {
		for (const cv of remotesIter) {
			let connected = true;
			if (
				isRecord(cv) &&
				"attendee" in cv &&
				isRecord((cv as Record<string, unknown>)["attendee"])
			) {
				const att = (cv as Record<string, unknown>)["attendee"] as Record<string, unknown>;
				let status: unknown = "Connected";
				if (typeof att["getConnectionStatus"] === "function") {
					status = (att["getConnectionStatus"] as (this: unknown) => unknown).call(att);
				}
				connected = status === "Connected";
			}
			if (!connected) continue;
			const val = isRecord(cv) ? (cv["value"] as unknown) : undefined;
			if (isRecord(val) && typeof val["id"] === "string") {
				const id = val["id"] as string;
				if (id === itemId) {
					const x = typeof val["x"] === "number" ? (val["x"] as number) : 0;
					const y = typeof val["y"] === "number" ? (val["y"] as number) : 0;
					const rotation =
						typeof val["rotation"] === "number" ? (val["rotation"] as number) : 0;
					return { id, x, y, rotation };
				}
			}
		}
	}
	return null;
}
