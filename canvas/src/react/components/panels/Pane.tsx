import { Button } from "@fluentui/react-button";
import { Text } from "@fluentui/react-text";
import { DismissFilled } from "@fluentui/react-icons";
import React from "react";

export function Pane(props: {
	children: React.ReactNode;
	hidden: boolean;
	setHidden: (hidden: boolean) => void;
	title: string;
}): JSX.Element {
	const { children, hidden, setHidden, title } = props;

	if (hidden) {
		return <></>;
	}

	return (
		<div className="flex flex-col bg-gray-100 p-4 gap-y-2 h-full max-w-80 min-w-80 border-l border-gray-300">
			<PaneTitleBar title={title} onClose={() => setHidden(true)} />
			{children}
		</div>
	);
}

export function PaneTitleBar(props: { title: string; onClose: () => void }): JSX.Element {
	const { title, onClose } = props;
	return (
		<div className="flex flex-row items-center justify-between mb-2">
			<Text weight="semibold" size={400}>
				{title}
			</Text>
			<CloseButton onClick={onClose} />
		</div>
	);
}

export function CloseButton(props: { onClick: () => void }): JSX.Element {
	const { onClick } = props;

	return <Button icon={<DismissFilled />} appearance="subtle" onClick={onClick} className="" />;
}
