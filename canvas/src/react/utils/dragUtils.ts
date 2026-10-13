import type { PresenceContext } from "../contexts/PresenceContext.js";
import type { DragAndRotatePackage } from "../../presence/drag.js";

export function getActiveDragForItem(
	presence: React.ContextType<typeof PresenceContext>,
	itemId: string
): DragAndRotatePackage | null {
	const local = presence.drag.state.local;
	if (local?.id === itemId) return local;
	for (const remote of presence.drag.state.getRemotes()) {
		if (remote.attendee.getConnectionStatus() === "Connected" && remote.value?.id === itemId) {
			return remote.value;
		}
	}
	return null;
}
