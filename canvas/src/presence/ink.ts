import { StateFactory, StatesWorkspace, Latest, LatestEvents } from "@fluidframework/presence/beta";
import { Listenable } from "fluid-framework";
import { InkPresenceManager } from "./Interfaces/InkManager.js";
import { EphemeralInkStroke, EphemeralPoint, validateEphemeralInkStroke } from "./validators.js";

/* eslint-disable @typescript-eslint/no-empty-object-type */
export function createInkPresenceManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
}): InkPresenceManager {
	const { workspace, name } = props;

	class InkPresenceManagerImpl implements InkPresenceManager {
		state: Latest<EphemeralInkStroke | null>;
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			workspace.add(
				name,
				StateFactory.latest<EphemeralInkStroke | null>({
					local: null,
					validator: validateEphemeralInkStroke,
				})
			);
			this.state = workspace.states[name];
		}
		get events(): Listenable<LatestEvents<EphemeralInkStroke | null>> {
			return this.state.events;
		}
		get attendees() {
			return this.state.presence.attendees;
		}
		setStroke(stroke: EphemeralInkStroke) {
			this.state.local = stroke;
		}
		updateStroke(points: EphemeralPoint[]) {
			const currentStroke = this.state.local;
			if (currentStroke) {
				this.state.local = { ...currentStroke, points };
			}
		}
		clearStroke() {
			this.state.local = null;
		}
		getRemoteStrokes() {
			const out: { stroke: EphemeralInkStroke; attendeeId: string }[] = [];
			for (const cv of this.state.getRemotes()) {
				const strokeValue = cv.value();
				if (strokeValue) {
					// Cast to mutable type for compatibility
					out.push({
						stroke: strokeValue as EphemeralInkStroke,
						attendeeId: cv.attendee.attendeeId,
					});
				}
			}
			return out;
		}
	}

	return new InkPresenceManagerImpl(name, workspace);
}
