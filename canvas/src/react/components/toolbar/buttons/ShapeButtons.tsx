/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import { Circle24Filled, ChevronDownRegular } from "@fluentui/react-icons";
import {
	Menu,
	MenuTrigger,
	MenuPopover,
	MenuList,
	ToolbarButton,
	Label,
	SwatchPicker,
	renderSwatchPickerGrid,
} from "@fluentui/react-components";
import { Shape } from "../../../../schema/appSchema.js";
import { Tree } from "@fluidframework/tree";

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

// Global shape color picker (always visible, doesn't require selected shapes)
export function ShapeColorPicker(props: {
	color: string;
	onColorChange: (color: string) => void;
	selectedShapes?: Shape[];
}): JSX.Element {
	const { color, onColorChange, selectedShapes = [] } = props;

	const handleColorChange = (newColor: string) => {
		// First, update the global shape color for future shapes
		onColorChange(newColor);

		// Then, if shapes are selected, update their colors too
		if (selectedShapes.length > 0) {
			Tree.runTransaction(selectedShapes[0], () => {
				selectedShapes.forEach((shape) => {
					shape.color = newColor;
				});
			});
		}
	};

	return (
		<Menu>
			<MenuTrigger>
				<ToolbarButton style={{ minWidth: 0 }}>
					<Circle24Filled color={color} />
					<ChevronDownRegular />
				</ToolbarButton>
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<ColorPicker
						setColor={handleColorChange}
						selected={color}
						ariaLabel="Shape color picker"
						label="Shape Color"
					/>
				</MenuList>
			</MenuPopover>
		</Menu>
	);
}

// Color Picker
export function ColorPicker(props: {
	setColor: (color: string) => void;
	selected: string | undefined;
	ariaLabel: string;
	columnCount?: number;
	label: string;
}): JSX.Element {
	const { setColor, selected, ariaLabel, columnCount = 5, label } = props;
	return (
		<>
			<Label>{label}</Label>
			<SwatchPicker
				layout="grid"
				shape="circular"
				size="small"
				aria-label={ariaLabel}
				selectedValue={selected}
				onSelectionChange={(_, d) => {
					if (d.selectedValue) setColor(d.selectedValue);
				}}
			>
				{renderSwatchPickerGrid({
					items: SHAPE_COLORS.map((color) => ({
						value: color,
						color,
						borderColor: "black",
					})),
					columnCount: columnCount,
				})}
			</SwatchPicker>
		</>
	);
}
