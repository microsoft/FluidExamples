import { useEffect, useReducer } from "react";
import type { PresenceContext } from "../contexts/PresenceContext.js";

export function useOverlayRerenders(presence: React.ContextType<typeof PresenceContext>) {
	const [, render] = useReducer((version: number) => version + 1, 0);

	useEffect(() => {
		let frame: number | undefined;
		const scheduleRender = () => {
			if (frame === undefined) {
				frame = requestAnimationFrame(() => {
					frame = undefined;
					render();
				});
			}
		};
		const cleanups: (() => void)[] = [];
		for (const manager of [
			presence.itemSelection,
			presence.drag,
			presence.resize,
			presence.ink,
			presence.users,
		]) {
			if (manager) {
				cleanups.push(
					manager.events.on("localUpdated", scheduleRender),
					manager.events.on("remoteUpdated", scheduleRender)
				);
			}
		}
		cleanups.push(
			presence.users.attendees.events.on("attendeeDisconnected", scheduleRender),
			presence.users.attendees.events.on("attendeeConnected", scheduleRender)
		);
		return () => {
			for (const cleanup of cleanups) cleanup();
			if (frame !== undefined) cancelAnimationFrame(frame);
		};
	}, [presence.itemSelection, presence.drag, presence.resize, presence.ink, presence.users]);
}
