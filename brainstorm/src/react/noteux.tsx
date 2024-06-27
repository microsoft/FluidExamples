/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useRef, useState } from "react";
import { Note, Group, Items } from "../schema/app_schema.js";
import { moveItem } from "../utils/app_helpers.js";
import { dragType, getRotation, selectAction } from "../utils/utils.js";
import { testRemoteNoteSelection, updateRemoteNoteSelection } from "../utils/session_helpers.js";
import { ConnectableElement, useDrag, useDrop } from "react-dnd";
import { useTransition } from "react-transition-state";
import { Tree } from "fluid-framework";
import { IconButton, MiniThumb, DeleteButton } from "./buttonux.js";
import { Session } from "../schema/session_schema.js";

export function RootNoteWrapper(props: {
	note: Note;
	clientId: string;
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
	const [invalSelection, setInvalSelection] = useState(0);
	const [noteText, setNoteText] = useState(props.note.text);
	const [noteVoteCount, setNoteVoteCount] = useState(props.note.votes.length);

	const parent = Tree.parent(props.note);
	if (parent === undefined || !Tree.is(parent, Items)) {
		return <></>;
	}

	const testSelection = (
		note: Note,
		session: Session,
		clientId: string,
		fluidMembers: string[],
	) => {
		const result = testRemoteNoteSelection(note, session, clientId, fluidMembers);
		setSelected(result.selected);
		setRemoteSelected(result.remoteSelected);
	};

	const updateSelection = (action: selectAction) => {
		updateRemoteNoteSelection(props.note, action, props.session, props.clientId);
	};

	// Register for tree deltas when the component mounts.
	// Any time the selection changes, the app will update
	// We are using the treeChanged event because we are listening for all
	// changes in the session tree.
	useEffect(() => {
		// Returns the cleanup function to be invoked when the component unmounts.
		const unsubscribe = Tree.on(props.session, "treeChanged", () => {
			setInvalSelection(invalSelection + Math.random());
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		testSelection(props.note, props.session, props.clientId, props.fluidMembers);
	}, [invalSelection]);

	// Register for tree deltas when the component mounts.
	// Any time the node changes, the app will update
	useEffect(() => {
		// Returns the cleanup function to be invoked when the component unmounts.
		const unsubscribe = Tree.on(props.note, "nodeChanged", () => {
			setNoteText(props.note.text);
			setNoteVoteCount(props.note.votes.length);
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		testSelection(props.note, props.session, props.clientId, props.fluidMembers);
	}, [props.fluidMembers]);

	useEffect(() => {
		mounted.current = true;
		testSelection(props.note, props.session, props.clientId, props.fluidMembers);

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
			if (Tree.is(item, Note)) return true;
			if (Tree.is(item, Group) && !Tree.contains(item, parent)) return true;
			return false;
		},
		drop: (item) => {
			if (Tree.is(item, Group) || Tree.is(item, Note)) {
				moveItem(item, parent.indexOf(props.note), parent);
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
			updateSelection(selectAction.REMOVE);
		} else if (e.shiftKey || e.ctrlKey) {
			updateSelection(selectAction.MULTI);
		} else {
			updateSelection(selectAction.SINGLE);
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
					<NoteToolbar
						voted={props.note.votes.indexOf(props.clientId) > -1}
						toggleVote={() => props.note.toggleVote(props.clientId)}
						voteCount={noteVoteCount}
						deleteNote={props.note.delete}
					/>
					<NoteTextArea
						text={noteText}
						update={props.note.updateText}
						select={updateSelection}
					/>
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

function NoteTextArea(props: {
	text: string;
	update: (text: string) => void;
	select: (value: selectAction) => void;
}): JSX.Element {
	// The text field updates the Fluid data model on every keystroke in this demo.
	// This works well with small strings but doesn't scale to very large strings.
	// A Future iteration of SharedTree will include support for collaborative strings
	// that make real-time collaboration on this type of data efficient and simple.

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (e.ctrlKey) {
			props.select(selectAction.MULTI);
		} else {
			props.select(selectAction.SINGLE);
		}
	};

	return (
		<textarea
			className="p-2 bg-transparent h-full w-full resize-none z-50"
			value={props.text}
			onClick={(e) => handleClick(e)}
			onChange={(e) => props.update(e.target.value)}
		/>
	);
}

function NoteToolbar(props: {
	voted: boolean;
	toggleVote: () => void;
	voteCount: number;
	deleteNote: () => void;
}): JSX.Element {
	return (
		<div className="flex justify-between z-50">
			<LikeButton {...props} />
			<DeleteNoteButton {...props} />
		</div>
	);
}

export function AddNoteButton(props: { target: Items; clientId: string }): JSX.Element {
	const [{ isActive }, drop] = useDrop(() => ({
		accept: [dragType.NOTE, dragType.GROUP],
		collect: (monitor) => ({
			isActive: monitor.canDrop() && monitor.isOver(),
		}),
		canDrop: (item) => {
			if (Tree.is(item, Note)) return true;
			if (Tree.is(item, Group) && !Tree.contains(item, props.target)) return true;
			return false;
		},
		drop: (item) => {
			if (Tree.is(item, Note) || Tree.is(item, Group)) {
				const parent = Tree.parent(item);
				if (Tree.is(parent, Items)) {
					const index = parent.indexOf(item);
					props.target.moveToEnd(index, parent);
				}
			}
			return;
		},
	}));

	let size = "h-48 w-48";
	let buttonText = "Add Note";
	if (props.target.length > 0) {
		buttonText = "+";
		size = "h-48";
	}

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.target.addNode(props.clientId);
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

function LikeButton(props: {
	voted: boolean;
	toggleVote: () => void;
	voteCount: number;
}): JSX.Element {
	const setColor = () => {
		if (props.voted) {
			return "text-white";
		} else {
			return undefined;
		}
	};

	const setBackground = () => {
		if (props.voted) {
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
				handleClick={() => props.toggleVote()}
				icon={MiniThumb()}
			>
				{props.voteCount}
			</IconButton>
		</div>
	);
}

function DeleteNoteButton(props: { deleteNote: () => void }): JSX.Element {
	return <DeleteButton handleClick={() => props.deleteNote()}></DeleteButton>;
}
