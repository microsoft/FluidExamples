/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import { CommentRegular, CommentFilled } from "@fluentui/react-icons";
import { TooltipButton } from "../../forms/Button.js";

// Comments pane toggle
export function CommentsPaneToggleButton(props: {
	paneHidden: boolean;
	onToggle: (hidden: boolean) => void;
}): JSX.Element {
	const { paneHidden, onToggle } = props;
	return (
		<TooltipButton
			onClick={() => onToggle(!paneHidden)}
			icon={paneHidden ? <CommentRegular /> : <CommentFilled />}
			tooltip={paneHidden ? "Show Comments" : "Hide Comments"}
			keyboardShortcut="Ctrl+M"
		/>
	);
}

// Generic pane toggle button
export function ShowPaneButton(props: {
	hidePane: (h: boolean) => void;
	paneHidden: boolean;
	hiddenIcon: JSX.Element;
	shownIcon: JSX.Element;
	tooltip?: string;
	keyboardShortcut?: string;
}): JSX.Element {
	const { hidePane, paneHidden, hiddenIcon, shownIcon, tooltip, keyboardShortcut } = props;
	return (
		<TooltipButton
			onClick={() => hidePane(!paneHidden)}
			icon={paneHidden ? hiddenIcon : shownIcon}
			tooltip={paneHidden ? `Show ${tooltip}` : `Hide ${tooltip}`}
			keyboardShortcut={keyboardShortcut}
		/>
	);
}
