/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useRef, useState } from "react";
import { Note, Group, Items } from "../schema/app_schema";
import { moveItem } from "../utils/app_helpers";
import { dragType, getRotation, isCircular, selectAction } from "../utils/utils";
import { testRemoteNoteSelection, updateRemoteNoteSelection } from "../utils/session_helpers";
import { ConnectableElement, useDrag, useDrop } from "react-dnd";
import { useTransition } from "react-transition-state";
import { Tree } from "fluid-framework";
import { IconButton, MiniThumb, DeleteButton } from "./buttonux";
import { Session } from "../schema/session_schema";

export function RootNoteWrapper(props: {
	note: Note;
	clientId: string;
	parent: Items;
	session: Session;
	fluidMembers: string[];
}): JSX.Element {
	return (
		<div className="bg-transparent flex flex-col justify-center h-64">
			<NoteView {...props} />
		</div>
	);
}

export function NoteView(props: {
	note: Note;
	clientId: string;
	parent: Items;
	session: Session;
	fluidMembers: string[];
}): JSX.Element {
	const mounted = useRef(false);

	const [{ status }, toggle] = useTransition({
		timeout: 1000,
	});

	const [selected, setSelected] = useState(false);

	const [remoteSelected, setRemoteSelected] = useState(false);

	const [bgColor, setBgColor] = useState("bg-yellow-100");

	const [rotation] = useState(getRotation(props.note));

	const [invalidations, setInvalidations] = useState(0);

	const test = () => {
		testRemoteNoteSelection(
			props.note,
			props.session,
			props.clientId,
			setRemoteSelected,
			setSelected,
			props.fluidMembers,
		);
	};

	const update = (action: selectAction) => {
		updateRemoteNoteSelection(props.note, action, props.session, props.clientId);
	};

	// Register for tree deltas when the component mounts.
	// Any time the tree changes, the app will update
	// For more complex apps, this code can be included
	// on lower level components.
	useEffect(() => {
		// Returns the cleanup function to be invoked when the component unmounts.
		const unsubscribe = Tree.on(props.session, "afterChange", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		test();
	}, [invalidations]);

	useEffect(() => {
		test();
	}, [props.fluidMembers]);

	useEffect(() => {
		mounted.current = true;
		test();

		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (selected) {
			setBgColor("bg-yellow-400");
		} else {
			setBgColor("bg-yellow-100");
		}
	}, [selected]);

	toggle(false);

	useEffect(() => {
		toggle(true);
	}, [Tree.parent(props.note)]);

	useEffect(() => {
		if (mounted.current) {
			toggle(true);
		}
	}, [props.note.text]);

	const [{ isDragging }, drag] = useDrag(() => ({
		type: dragType.NOTE,
		item: props.note,
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	}));

	const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: [dragType.NOTE, dragType.GROUP],
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
		canDrop: (item) => {
			if (item instanceof Note) return true;
			if (item instanceof Group && !isCircular(item, props.parent)) return true;
			return false;
		},
		drop: (item) => {
			const droppedItem = item;
			if (droppedItem instanceof Group || droppedItem instanceof Note) {
				moveItem(droppedItem, props.parent.indexOf(props.note), props.parent);
			}
			return;
		},
	}));

	const attachRef = (el: ConnectableElement) => {
		drag(el);
		drop(el);
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (selected) {
			update(selectAction.REMOVE);
		} else if (e.shiftKey || e.ctrlKey) {
			update(selectAction.MULTI);
		} else {
			update(selectAction.SINGLE);
		}
	};

	return (
		<div
			onClick={(e) => handleClick(e)}
			className={`transition duration-500${
				status === "exiting" ? " transform ease-out scale-110" : ""
			}`}
		>
			<div
				ref={attachRef}
				className={
					isOver && canDrop
						? "border-l-4 border-dashed border-gray-500"
						: "border-l-4 border-dashed border-transparent"
				}
			>
				<div
					style={{ opacity: isDragging ? 0.5 : 1 }}
					className={
						"relative transition-all flex flex-col " +
						bgColor +
						" h-48 w-48 shadow-md hover:shadow-lg hover:rotate-0 p-2 " +
						rotation +
						" " +
						(isOver && canDrop ? "translate-x-3" : "")
					}
				>
					<NoteToolbar note={props.note} clientId={props.clientId} notes={props.parent} />
					<NoteTextArea note={props.note} update={update} />
					<NoteSelection show={remoteSelected} />
				</div>
			</div>
		</div>
	);
}

function NoteSelection(props: { show: boolean }): JSX.Element {
	if (props.show) {
		return (
			<div className="absolute -top-2 -left-2 h-52 w-52 rounded border-dashed border-indigo-800 border-4" />
		);
	} else {
		return <></>;
	}
}

function NoteTextArea(props: { note: Note; update: (value: selectAction) => void }): JSX.Element {
	// The text field updates the Fluid data model on every keystroke in this demo.
	// This works well with small strings but doesn't scale to very large strings.
	// A Future iteration of SharedTree will include support for collaborative strings
	// that make real-time collaboration on this type of data efficient and simple.

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (e.ctrlKey) {
			props.update(selectAction.MULTI);
		} else {
			props.update(selectAction.SINGLE);
		}
	};

	return (
		<textarea
			className="p-2 bg-transparent h-full w-full resize-none z-50"
			value={props.note.text}
			onClick={(e) => handleClick(e)}
			onChange={(e) => props.note.updateText(e.target.value)}
		/>
	);
}

function NoteToolbar(props: { note: Note; clientId: string; notes: Items }): JSX.Element {
	return (
		<div className="flex justify-between z-50">
			<LikeButton note={props.note} clientId={props.clientId} />
			<DeleteNoteButton note={props.note} notes={props.notes} />
		</div>
	);
}

export function AddNoteButton(props: { parent: Items; clientId: string }): JSX.Element {
	const [{ isActive }, drop] = useDrop(() => ({
		accept: [dragType.NOTE, dragType.GROUP],
		collect: (monitor) => ({
			isActive: monitor.canDrop() && monitor.isOver(),
		}),
		canDrop: (item) => {
			if (item instanceof Note) return true;
			if (item instanceof Group && !isCircular(item, props.parent)) return true;
			return false;
		},
		drop: (item) => {
			const droppedItem = item;
			if (droppedItem instanceof Note || droppedItem instanceof Group) {
				const parent = Tree.parent(droppedItem);
				if (Tree.is(parent, Items)) {
					const index = parent.indexOf(droppedItem);
					props.parent.moveToEnd(index, parent);
				}
			}
			return;
		},
	}));

	let size = "h-48 w-48";
	let buttonText = "Add Note";
	if (props.parent.length > 0) {
		buttonText = "+";
		size = "h-48";
	}

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.parent.addNode(props.clientId);
	};

	const hoverEffectStyle = "absolute top-0 left-0 border-l-4 border-dashed h-48 ";

	return (
		<div className="relative transition-all">
			<div
				className={
					isActive
						? hoverEffectStyle + "border-gray-500"
						: hoverEffectStyle + "border-transparent"
				}
			></div>
			<div
				ref={drop}
				className={
					"transition-all text-2xl place-content-center font-bold flex flex-col text-center cursor-pointer bg-transparent border-white border-dashed border-8 " +
					size +
					" p-4 hover:border-black" +
					" " +
					(isActive ? "translate-x-3" : "")
				}
				onClick={(e) => handleClick(e)}
			>
				{buttonText}
			</div>
		</div>
	);
}

function LikeButton(props: { note: Note; clientId: string }): JSX.Element {
	const setColor = () => {
		if (props.note.votes.indexOf(props.clientId) > -1) {
			return "text-white";
		} else {
			return undefined;
		}
	};

	const setBackground = () => {
		if (props.note.votes.indexOf(props.clientId) > -1) {
			return "bg-green-600";
		} else {
			return undefined;
		}
	};

	return (
		<div className="relative flex z-50">
			<IconButton
				color={setColor()}
				background={setBackground()}
				handleClick={() => props.note.toggleVote(props.clientId)}
				icon={MiniThumb()}
			>
				{props.note.votes.length}
			</IconButton>
		</div>
	);
}

function DeleteNoteButton(props: { note: Note; notes: Items }): JSX.Element {
	return <DeleteButton handleClick={() => props.note.delete()}></DeleteButton>;
}
