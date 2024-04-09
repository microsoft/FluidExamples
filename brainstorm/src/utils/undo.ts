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

	const unsubscribeFromDisposed = events.on("revertibleDisposed", (revertible) => {
		const redoIndex = redoStack.indexOf(revertible);
		if (redoIndex !== -1) {
			redoStack.splice(redoIndex, 1);
		} else {
			const undoIndex = undoStack.indexOf(revertible);
			if (undoIndex !== -1) {
				undoStack.splice(undoIndex, 1);
			}
		}
	});

	const unsubscribe = () => {
		unsubscribeFromNew();
		unsubscribeFromDisposed();
		for (const revertible of undoStack) {
			revertible.release();
		}
		for (const revertible of redoStack) {
			revertible.release();
		}
	};
	return { undoStack, redoStack, unsubscribe };
}

export function revertFromStack(undoStack: Revertible[]) {
	const revertible = undoStack.pop();
	if (revertible !== undefined) {
		revertible.revert();
	}
}
