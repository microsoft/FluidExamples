/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { Group, Items, Note } from "../schema/app_schema.js";
import { moveItem } from "../utils/app_helpers.js";
import { ConnectableElement, useDrag, useDrop } from "react-dnd";
import { DeleteButton } from "./buttonux.js";
import { dragType } from "../utils/utils.js";
import { Session } from "../schema/session_schema.js";
import { ItemsView } from "./canvasux.js";
import { Tree } from "fluid-framework";

export function GroupView(props: {
	group: Group;
	clientId: string;
	parent: Items;
	session: Session;
	fluidMembers: string[];
}): JSX.Element {
	const [invalidations, setInvalidations] = useState(0);

	// Register for tree deltas when the component mounts.
	// Any time the items array changes, the app will update
	// Note, we are only listening to changes to the array
	// not the items within the array. Those changes are
	// handled by the NoteView component.
	useEffect(() => {
		const unsubscribe = Tree.on(props.group.items, "nodeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, []);

	// Register for tree deltas when the component mounts.
	// Any time the group changes, the app will update
	useEffect(() => {
		const unsubscribe = Tree.on(props.group, "nodeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, []);

	const [, drag] = useDrag(() => ({
		type: dragType.GROUP,
		item: props.group,
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	}));

	const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: [dragType.NOTE, dragType.GROUP],
		collect: (monitor) => ({
			isOver: !!monitor.isOver({ shallow: true }),
			canDrop: !!monitor.canDrop(),
		}),
		canDrop: (item) => {
			if (Tree.is(item, Note)) return true;
			if (Tree.is(item, Group) && !Tree.contains(item, props.parent)) return true;
			return false;
		},
		drop: (item, monitor) => {
			const didDrop = monitor.didDrop();
			if (didDrop) {
				return;
			}

			const isOver = monitor.isOver({ shallow: true });
			if (!isOver) {
				return;
			}

			const droppedItem = item;
			if (Tree.is(droppedItem, Group) || Tree.is(droppedItem, Note)) {
				moveItem(droppedItem, props.parent.indexOf(props.group), props.parent);
			}

			return;
		},
	}));

	function attachRef(el: ConnectableElement) {
		drag(el);
		drop(el);
	}

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<div
			onClick={(e) => handleClick(e)}
			ref={attachRef}
			className={
				"transition-all border-l-4 border-dashed " +
				(isOver && canDrop ? "border-gray-500" : "border-transparent")
			}
		>
			<div
				className={
					"p-2 bg-gray-200 min-h-64 transition-all " +
					(isOver && canDrop ? "translate-x-3" : "")
				}
			>
				<GroupToolbar pile={props.group} parent={props.parent} />
				<ItemsView
					items={props.group.items}
					clientId={props.clientId}
					session={props.session}
					fluidMembers={props.fluidMembers}
					isRoot={false}
				/>
			</div>
		</div>
	);
}

function GroupName(props: { pile: Group }): JSX.Element {
	return (
		<input
			className="flex w-0 grow p-1 mb-2 mr-2 text-lg font-bold text-black bg-transparent"
			type="text"
			value={props.pile.name}
			onChange={(event) => (props.pile.name = event.target.value)}
		/>
	);
}

function GroupToolbar(props: { pile: Group; parent: Items }): JSX.Element {
	return (
		<div className="flex flex-row justify-between">
			<GroupName pile={props.pile} />
			<DeletePileButton pile={props.pile} items={props.parent} />
		</div>
	);
}

export function DeletePileButton(props: { pile: Group; items: Items }): JSX.Element {
	return <DeleteButton handleClick={() => props.pile.delete()}></DeleteButton>;
}
