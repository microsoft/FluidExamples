/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import { ArrowUndoFilled, ArrowRedoFilled, DeleteRegular } from "@fluentui/react-icons";
import { TooltipButton } from "../../forms/Button.js";

// Undo / Redo buttons
export function UndoButton(props: { onUndo: () => void; disabled?: boolean }): JSX.Element {
	const { onUndo, disabled } = props;
	return (
		<TooltipButton
			tooltip="Undo"
			keyboardShortcut="Ctrl+Z"
			onClick={() => onUndo()}
			icon={<ArrowUndoFilled />}
			disabled={disabled}
		/>
	);
}

export function RedoButton(props: { onRedo: () => void; disabled?: boolean }): JSX.Element {
	const { onRedo, disabled } = props;
	return (
		<TooltipButton
			tooltip="Redo"
			keyboardShortcut="Ctrl+Y"
			onClick={() => onRedo()}
			icon={<ArrowRedoFilled />}
			disabled={disabled}
		/>
	);
}

// Clear All button
export function ClearAllButton(props: { onClear: () => void; disabled?: boolean }): JSX.Element {
	const { onClear, disabled } = props;
	return (
		<TooltipButton
			tooltip="Remove all items and ink"
			keyboardShortcut="Ctrl+Shift+Delete"
			icon={<DeleteRegular />}
			onClick={() => onClear()}
			disabled={disabled}
		/>
	);
}
