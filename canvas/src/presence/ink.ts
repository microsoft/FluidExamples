import {
	StateFactory,
	StatesWorkspace,
	LatestRaw,
	LatestRawEvents,
} from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { InkPresenceManager, EphemeralInkStroke, EphemeralPoint } from "./Interfaces/InkManager.js";

/* eslint-disable @typescript-eslint/no-empty-object-type */
export function createInkPresenceManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): InkPresenceManager {
	const { workspace, name } = props;

	class InkPresenceManagerImpl implements InkPresenceManager {
		state: LatestRaw<EphemeralInkStroke | null>;
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			workspace.add(name, StateFactory.latest<EphemeralInkStroke | null>({ local: null }));
			this.state = workspace.states[name];
		}
		get events(): Listenable<LatestRawEvents<EphemeralInkStroke | null>> {
			return this.state.events;
		}
		get attendees() {
			return this.state.presence.attendees;
		}
		setStroke(stroke: EphemeralInkStroke) {
			this.state.local = stroke;
		}
		updateStroke(points: EphemeralPoint[]) {
			if (this.state.local) {
				this.state.local = { ...this.state.local, points };
			}
		}
		clearStroke() {
			this.state.local = null;
		}
		getRemoteStrokes() {
			const out: { stroke: EphemeralInkStroke; attendeeId: string }[] = [];
			for (const cv of this.state.getRemotes()) {
				if (cv.value) {
					out.push({ stroke: cv.value, attendeeId: cv.attendee.attendeeId });
				}
			}
			return out;
		}
	}

	return new InkPresenceManagerImpl(name, workspace);
}
