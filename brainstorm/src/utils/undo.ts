import { CommitKind, ISubscribable, Revertible, TreeViewEvents } from "fluid-framework";

export function createUndoRedoStacks(events: ISubscribable<TreeViewEvents>): {
	undoStack: Revertible[];
	redoStack: Revertible[];
	unsubscribe: () => void;
} {
	const undoStack: Revertible[] = [];
	const redoStack: Revertible[] = [];

	const unsubscribeFromNew = events.on("commitApplied", ({ kind }, getRevertible) => {
		if (getRevertible !== undefined) {
			const revertible = getRevertible();
			if (kind === CommitKind.Undo) {
				redoStack.push(revertible);
			} else {
				undoStack.push(revertible);
			}
		}
	});

	const unsubscribe = () => {
		unsubscribeFromNew();
	};

	return { undoStack, redoStack, unsubscribe };
}

export function revertFromStack(undoStack: Revertible[]) {
	const revertible = undoStack.pop();
	if (revertible !== undefined) {
		revertible.revert();
	}
}
