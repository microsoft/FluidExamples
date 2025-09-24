/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext } from "react";
import {
	CircleRegular,
	SquareRegular,
	TriangleRegular,
	StarRegular,
	NoteRegular,
	TableRegular,
} from "@fluentui/react-icons";
import { TooltipButton } from "../../forms/Button.js";
import { useTree } from "../../../hooks/useTree.js";
import { PresenceContext } from "../../../contexts/PresenceContext.js";
import { Items } from "../../../../schema/appSchema.js";
import { centerLastItem } from "../../../../utils/centerItem.js";

export const SHAPE_COLORS = [
	"#000000",
	"#FFFFFF",
	"#FF0000",
	"#33FF57",
	"#3357FF",
	"#FF33A1",
	"#A133FF",
	"#33FFF5",
	"#F5FF33",
	"#FF8C33",
];

// Shape / item creation buttons
export function NewCircleButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
	shapeColor?: string;
}): JSX.Element {
	const { items, canvasSize, pan, zoom, shapeColor } = props;
	useTree(items);
	return (
		<TooltipButton
			onClick={(e) => {
				e.stopPropagation();
				// Use the specific color or fallback to random selection
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				items.createShapeItem("circle", canvasSize, colors);
				centerLastItem(items, pan, zoom, canvasSize);
			}}
			icon={<CircleRegular />}
			tooltip="Add a circle shape"
			keyboardShortcut="C"
		/>
	);
}

export function NewSquareButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
	shapeColor?: string;
}): JSX.Element {
	const { items, canvasSize, pan, zoom, shapeColor } = props;
	useTree(items);
	return (
		<TooltipButton
			onClick={(e) => {
				e.stopPropagation();
				// Use the specific color or fallback to random selection
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				items.createShapeItem("square", canvasSize, colors);
				centerLastItem(items, pan, zoom, canvasSize);
			}}
			icon={<SquareRegular />}
			tooltip="Add a square shape"
			keyboardShortcut="S"
		/>
	);
}

export function NewTriangleButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
	shapeColor?: string;
}): JSX.Element {
	const { items, canvasSize, pan, zoom, shapeColor } = props;
	useTree(items);
	return (
		<TooltipButton
			onClick={(e) => {
				e.stopPropagation();
				// Use the specific color or fallback to random selection
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				items.createShapeItem("triangle", canvasSize, colors);
				centerLastItem(items, pan, zoom, canvasSize);
			}}
			icon={<TriangleRegular />}
			tooltip="Add a triangle shape"
			keyboardShortcut="T"
		/>
	);
}

export function NewStarButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
	shapeColor?: string;
}): JSX.Element {
	const { items, canvasSize, pan, zoom, shapeColor } = props;
	useTree(items);
	return (
		<TooltipButton
			onClick={(e) => {
				e.stopPropagation();
				// Use the specific color or fallback to random selection
				const colors = shapeColor ? [shapeColor] : SHAPE_COLORS;
				items.createShapeItem("star", canvasSize, colors);
				centerLastItem(items, pan, zoom, canvasSize);
			}}
			icon={<StarRegular />}
			tooltip="Add a star shape"
			keyboardShortcut="R"
		/>
	);
}

export function NewNoteButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
}): JSX.Element {
	const { items, canvasSize, pan, zoom } = props;
	useTree(items);
	const presence = useContext(PresenceContext);
	return (
		<TooltipButton
			onClick={(e) => {
				e.stopPropagation();
				items.createNoteItem(canvasSize, presence.users.getMyself().value.id);
				centerLastItem(items, pan, zoom, canvasSize, 180, 120);
			}}
			icon={<NoteRegular />}
			tooltip="Add a sticky note"
			keyboardShortcut="N"
		/>
	);
}

export function NewTableButton(props: {
	items: Items;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	zoom?: number;
}): JSX.Element {
	const { items, canvasSize, pan, zoom } = props;
	useTree(items);
	return (
		<TooltipButton
			onClick={(e) => {
				e.stopPropagation();
				items.createTableItem(canvasSize);
				centerLastItem(items, pan, zoom, canvasSize, 240, 160);
			}}
			icon={<TableRegular />}
			tooltip="Add a data table"
			keyboardShortcut="B"
		/>
	);
}
