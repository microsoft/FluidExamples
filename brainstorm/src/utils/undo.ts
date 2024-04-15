import {
	CommitKind,
	CommitMetadata,
	ISubscribable,
	Revertible,
	RevertibleFactory,
	TreeViewEvents,
	disposeSymbol,
} from "fluid-framework";

export function createUndoRedoStacks(events: ISubscribable<TreeViewEvents>): {
	undoStack: Revertible[];
	redoStack: Revertible[];
	unsubscribe: () => void;
} {
	const undoStack: Revertible[] = [];
	const redoStack: Revertible[] = [];

	function onDispose(disposed: Revertible): void {
		const redoIndex = redoStack.indexOf(disposed);
		if (redoIndex !== -1) {
			redoStack.splice(redoIndex, 1);
		} else {
			const undoIndex = undoStack.indexOf(disposed);
			if (undoIndex !== -1) {
				undoStack.splice(undoIndex, 1);
			}
		}
	}

	function onNewCommit(commit: CommitMetadata, getRevertible?: RevertibleFactory): void {
		if (getRevertible !== undefined) {
			const revertible = getRevertible(onDispose);
			if (commit.kind === CommitKind.Undo) {
				redoStack.push(revertible);
			} else {
				if (commit.kind === CommitKind.Default) {
					// clear redo stack
					for (const redo of redoStack) {
						redo[disposeSymbol]();
					}
					redoStack.length = 0;
				}
				undoStack.push(revertible);
			}
		}
	}

	const unsubscribeFromCommitApplied = events.on("commitApplied", onNewCommit);
	const unsubscribe = () => {
		unsubscribeFromCommitApplied();
		for (const revertible of undoStack) {
			revertible[disposeSymbol]();
		}
		for (const revertible of redoStack) {
			revertible[disposeSymbol]();
		}
	};
	return { undoStack, redoStack, unsubscribe };
}

export function revertFromStack(stack: Revertible[]): void {
	const revertible = stack.pop();
	revertible?.revert();
}
