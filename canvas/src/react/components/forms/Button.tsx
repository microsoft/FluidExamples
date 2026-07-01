import { Tooltip } from "@fluentui/react-tooltip";
import { ToolbarButton } from "@fluentui/react-toolbar";
import React, { JSX } from "react";

export function TooltipButton(props: {
	onClick: (e: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	tooltip?: string;
	keyboardShortcut?: string;
	disabled?: boolean;
	active?: boolean;
	className?: string;
}): JSX.Element {
	const { children, tooltip, keyboardShortcut, active, icon, className, ...btnRest } = props;

	const tooltipContent = keyboardShortcut
		? `${tooltip ?? "No Tooltip Provided"} (${keyboardShortcut})`
		: (tooltip ?? "No Tooltip Provided");

	const finalClass = [className, active ? "bg-blue-600 text-white" : undefined]
		.filter(Boolean)
		.join(" ");

	return (
		<Tooltip content={tooltipContent} relationship="description">
			<ToolbarButton
				icon={icon}
				className={finalClass || undefined}
				aria-label={tooltip ?? "No Tooltip Provided"}
				{...btnRest}
			>
				{children}
			</ToolbarButton>
		</Tooltip>
	);
}

export function IconButton(props: {
	onClick: (value: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	disabled?: boolean;
}): JSX.Element {
	const { children } = props;
	return <ToolbarButton {...props}>{children}</ToolbarButton>;
}
