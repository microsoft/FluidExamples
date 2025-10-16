/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import {
	TableInsertColumnRegular,
	TableInsertRowRegular,
	ChevronLeftRegular,
	ChevronRightRegular,
	ChevronUpRegular,
	ChevronDownRegular,
} from "@fluentui/react-icons";
import { TooltipButton } from "../../forms/Button.js";
import { useTree } from "../../../hooks/useTree.js";
import { FluidTable } from "../../../../schema/appSchema.js";

// Simple table manipulation buttons for basic table operations
export function AddColumnButton(props: { table: FluidTable }): JSX.Element {
	const { table } = props;
	useTree(table);
	return (
		<TooltipButton
			onClick={() => table.addColumn()}
			icon={<TableInsertColumnRegular />}
			tooltip="Add a new column"
			keyboardShortcut="Ctrl+Shift+C"
		/>
	);
}

export function AddRowButton(props: { table: FluidTable }): JSX.Element {
	const { table } = props;
	useTree(table);
	return (
		<TooltipButton
			onClick={() => table.addRow()}
			icon={<TableInsertRowRegular />}
			tooltip="Add a new row"
			keyboardShortcut="Ctrl+Shift+R"
		/>
	);
}

export function MoveColumnLeftButton(props: {
	table: FluidTable;
	selectedColumnId?: string;
}): JSX.Element {
	const { table, selectedColumnId } = props;
	useTree(table);
	const col = selectedColumnId ? table.columns.find((c) => c.id === selectedColumnId) : undefined;
	const can = col && table.columns.indexOf(col) > 0;
	return (
		<TooltipButton
			onClick={() => {
				if (col && can) table.moveColumnLeft(col);
			}}
			icon={<ChevronLeftRegular />}
			tooltip="Move column left"
			keyboardShortcut="Ctrl+Shift+Left"
			disabled={!can}
		/>
	);
}

export function MoveColumnRightButton(props: {
	table: FluidTable;
	selectedColumnId?: string;
}): JSX.Element {
	const { table, selectedColumnId } = props;
	useTree(table);
	const col = selectedColumnId ? table.columns.find((c) => c.id === selectedColumnId) : undefined;
	const can = col && table.columns.indexOf(col) < table.columns.length - 1;
	return (
		<TooltipButton
			onClick={() => {
				if (col && can) table.moveColumnRight(col);
			}}
			icon={<ChevronRightRegular />}
			tooltip="Move column right"
			keyboardShortcut="Ctrl+Shift+Right"
			disabled={!can}
		/>
	);
}

export function MoveRowUpButton(props: { table: FluidTable; selectedRowId?: string }): JSX.Element {
	const { table, selectedRowId } = props;
	useTree(table);
	const row = selectedRowId ? table.rows.find((r) => r.id === selectedRowId) : undefined;
	const can = row && table.rows.indexOf(row) > 0;
	return (
		<TooltipButton
			onClick={() => {
				if (row && can) table.moveRowUp(row);
			}}
			icon={<ChevronUpRegular />}
			tooltip="Move row up"
			keyboardShortcut="Ctrl+Shift+Up"
			disabled={!can}
		/>
	);
}

export function MoveRowDownButton(props: {
	table: FluidTable;
	selectedRowId?: string;
}): JSX.Element {
	const { table, selectedRowId } = props;
	useTree(table);
	const row = selectedRowId ? table.rows.find((r) => r.id === selectedRowId) : undefined;
	const can = row && table.rows.indexOf(row) < table.rows.length - 1;
	return (
		<TooltipButton
			onClick={() => {
				if (row && can) table.moveRowDown(row);
			}}
			icon={<ChevronDownRegular />}
			tooltip="Move row down"
			keyboardShortcut="Ctrl+Shift+Down"
			disabled={!can}
		/>
	);
}
