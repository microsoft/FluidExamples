/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Items, Note } from "../schema/app_schema.js";
import { moveItem, findNote } from "../utils/app_helpers.js";
import {
	ThumbLikeFilled,
	DismissFilled,
	NoteRegular,
	DeleteRegular,
	RectangleLandscapeRegular,
	ArrowUndoFilled,
	ArrowRedoFilled,
} from "@fluentui/react-icons";
import { Session } from "../schema/session_schema.js";
import { getSelectedNotes } from "../utils/session_helpers.js";
import { Tree } from "fluid-framework";

export function NewGroupButton(props: {
	items: Items;
	session: Session;
	clientId: string;
}): JSX.Element {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Wrap the add group operation in a transaction as it adds a group and potentially moves
		// multiple notes into the group and we want to ensure that the operation is atomic.
		// This ensures that the revertible of the operation will undo all the changes made by the operation.
		Tree.runTransaction(props.items, () => {
			const group = props.items.addGroup("[new group]");
			const ids = getSelectedNotes(props.session, props.clientId);
			for (const id of ids) {
				const n = findNote(props.items, id);
				if (Tree.is(n, Note)) {
					moveItem(n, Infinity, group.items);
				}
			}
		});
	};
	return (
		<IconButton
			color="white"
			background="black"
			handleClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<RectangleLandscapeRegular />}
		>
			Add Group
		</IconButton>
	);
}

export function NewNoteButton(props: { items: Items; clientId: string }): JSX.Element {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.items.addNode(props.clientId);
	};

	return (
		<IconButton
			color="white"
			background="black"
			handleClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<NoteRegular />}
		>
			Add Note
		</IconButton>
	);
}

export function DeleteNotesButton(props: {
	session: Session;
	items: Items;
	clientId: string;
}): JSX.Element {
	const handleClick = () => {
		// Wrap the delete operation in a transaction as it potentially modifies multiple notes
		// and we want to ensure that the operation is atomic. This ensures that the revertible of
		// the operation will undo all the changes made by the operation.
		Tree.runTransaction(props.items, () => {
			const ids = getSelectedNotes(props.session, props.clientId);
			for (const i of ids) {
				const n = findNote(props.items, i);
				n?.delete();
			}
		});
	};
	return (
		<IconButton
			color="white"
			background="black"
			handleClick={() => handleClick()}
			icon={<DeleteRegular />}
		>
			Delete Note
		</IconButton>
	);
}

export function UndoButton(props: { undo: () => void }): JSX.Element {
	return (
		<IconButton
			color="white"
			background="black"
			handleClick={() => props.undo()}
			icon={<ArrowUndoFilled />}
		>
			Undo
		</IconButton>
	);
}

export function RedoButton(props: { redo: () => void }): JSX.Element {
	return (
		<IconButton
			color="white"
			background="black"
			handleClick={() => props.redo()}
			icon={<ArrowRedoFilled />}
		>
			Redo
		</IconButton>
	);
}

export function DeleteButton(props: {
	handleClick: (value: React.MouseEvent) => void;
}): JSX.Element {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.handleClick(e);
	};
	return (
		<button
			className={
				"bg-transparent hover:bg-gray-600 text-black hover:text-white font-bold px-2 py-1 rounded inline-flex items-center h-6"
			}
			onClick={(e) => handleClick(e)}
		>
			{MiniX()}
		</button>
	);
}

export function IconButton(props: {
	handleClick: (value: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	color?: string;
	background?: string;
}): JSX.Element {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.handleClick(e);
	};

	return (
		<button
			className={
				props.color +
				" " +
				props.background +
				" hover:bg-gray-600 hover:text-white font-bold px-2 py-1 rounded inline-flex items-center h-6 grow"
			}
			onClick={(e) => handleClick(e)}
		>
			{props.icon}
			<IconButtonText>{props.children}</IconButtonText>
		</button>
	);
}

IconButton.defaultProps = {
	color: "text-gray-600",
	background: "bg-transparent",
};

function IconButtonText(props: { children: React.ReactNode }): JSX.Element {
	if (props.children == undefined) {
		return <span></span>;
	} else {
		return <span className="text-sm pl-2 leading-none">{props.children}</span>;
	}
}

function MiniX(): JSX.Element {
	return <DismissFilled />;
}

export function MiniThumb(): JSX.Element {
	return <ThumbLikeFilled />;
}

export function ButtonGroup(props: { children: React.ReactNode }): JSX.Element {
	return <div className="flex flex-intial items-center">{props.children}</div>;
}

export function Floater(props: { children: React.ReactNode }): JSX.Element {
	return (
		<div className="transition transform absolute z-100 bottom-0 inset-x-0 pb-2 sm:pb-5 opacity-100 scale-100 translate-y-0 ease-out duration-500 text-white">
			<div className="max-w-screen-md mx-auto px-2 sm:px-4">
				<div className="p-2 rounded-lg bg-black shadow-lg sm:p-3">
					<div className="flex flex-row items-center justify-between flex-wrap">
						{props.children}
					</div>
				</div>
			</div>
		</div>
	);
}
