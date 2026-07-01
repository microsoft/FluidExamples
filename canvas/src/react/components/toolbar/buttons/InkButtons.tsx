/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import {
	InkingToolFilled,
	InkingToolRegular,
	EraserToolFilled,
	EraserToolRegular,
	Circle24Filled,
	ChevronDownRegular,
} from "@fluentui/react-icons";
import { TooltipButton } from "../../forms/Button.js";
import {
	Menu,
	MenuTrigger,
	MenuPopover,
	MenuList,
	MenuDivider,
	ToolbarButton,
	Label,
	SwatchPicker,
	renderSwatchPickerGrid,
} from "@fluentui/react-components";

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

// Ink / Eraser toggles
export function InkToggleButton(props: {
	inkActive: boolean;
	eraserActive: boolean;
	onToggleInk: () => void;
	onToggleEraser: () => void;
}): JSX.Element {
	const { inkActive, eraserActive, onToggleInk, onToggleEraser } = props;
	return (
		<TooltipButton
			tooltip={inkActive ? "Exit ink mode" : "Enter ink mode"}
			onClick={() => {
				if (eraserActive) onToggleEraser();
				onToggleInk();
			}}
			icon={
				<span style={{ fontSize: 14 }}>
					{inkActive ? <InkingToolFilled /> : <InkingToolRegular />}
				</span>
			}
			active={inkActive}
		/>
	);
}

export function EraserToggleButton(props: {
	inkActive: boolean;
	eraserActive: boolean;
	onToggleInk: () => void;
	onToggleEraser: () => void;
}): JSX.Element {
	const { inkActive, eraserActive, onToggleInk, onToggleEraser } = props;
	return (
		<TooltipButton
			tooltip={eraserActive ? "Exit eraser" : "Eraser"}
			onClick={() => {
				if (inkActive) onToggleInk();
				onToggleEraser();
			}}
			icon={
				<span style={{ fontSize: 14 }}>
					{eraserActive ? <EraserToolFilled /> : <EraserToolRegular />}
				</span>
			}
			active={eraserActive}
		/>
	);
}

// Ink Color Picker
export function InkColorPicker(props: {
	setColor: (color: string) => void;
	selected: string | undefined;
	ariaLabel: string;
	inkWidth: number;
	onInkWidthChange: (arg: number) => void;
}): JSX.Element {
	const { setColor, selected, ariaLabel, inkWidth, onInkWidthChange } = props;

	return (
		<Menu>
			<MenuTrigger>
				<ToolbarButton style={{ minWidth: 0 }}>
					<Circle24Filled color={selected ?? "linear-gradient(45deg,#888,#444)"} />
					<ChevronDownRegular />
				</ToolbarButton>
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<ColorPicker
						setColor={setColor}
						selected={selected}
						ariaLabel={ariaLabel}
						label="Ink Color"
					/>
					<MenuDivider></MenuDivider>
					<InkThicknessPalette
						inkWidth={inkWidth}
						inkColor={selected}
						onInkWidthChange={onInkWidthChange}
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

export function InkThicknessPalette(props: {
	inkWidth: number;
	inkColor: string | undefined;
	onInkWidthChange: (arg: number) => void;
}): JSX.Element {
	const { inkWidth, inkColor, onInkWidthChange } = props;

	// Define the 5 thickness options
	const thicknessOptions = [4, 8, 16, 24, 32];
	const currentColor = inkColor || "#000000";

	return (
		<>
			<Label>Thickness</Label>
			<div
				style={{
					display: "flex",
					gap: "4px",
					alignItems: "center",
					padding: "8px 0",
					flexWrap: "wrap",
				}}
			>
				{thicknessOptions.map((thickness) => (
					<button
						key={thickness}
						onClick={() => onInkWidthChange(thickness)}
						style={{
							width: "36px",
							height: "36px",
							border:
								inkWidth === thickness ? "3px solid #0078d4" : "2px solid #e1e1e1",
							borderRadius: "50%",
							backgroundColor: "white",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "0",
							transition: "border-color 0.2s ease",
						}}
						aria-label={`Set ink thickness to ${thickness}px`}
						title={`${thickness}px thickness`}
					>
						<div
							style={{
								width: `${thickness}px`,
								height: `${thickness}px`,
								backgroundColor: currentColor,
								borderRadius: "50%",
								border: currentColor === "#FFFFFF" ? "1px solid #ccc" : "none",
							}}
						/>
					</button>
				))}
			</div>
		</>
	);
}
