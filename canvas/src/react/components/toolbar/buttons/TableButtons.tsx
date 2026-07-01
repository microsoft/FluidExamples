/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import {
	FluidColumn,
	FluidRow,
	FluidTable,
	FluidColumnSchema,
	HintValues,
	hintValues,
} from "../../../../schema/appSchema.js";
import {
	DismissFilled,
	ArrowUndoFilled,
	ArrowRedoFilled,
	ColumnFilled,
	CaretDown16Filled,
	TableInsertRowFilled,
	TableInsertRowRegular,
	RowTripleFilled,
	TableDeleteRowFilled,
	TableMoveAboveFilled,
	TableMoveBelowFilled,
	TableMoveLeftFilled,
	TableMoveRightFilled,
} from "@fluentui/react-icons";
import { Tree, TreeStatus } from "fluid-framework";
import { useTableButtonState } from "../../../../utils/eventSubscriptions.js";
import { selectionType, TypedSelection } from "../../../../presence/selection.js";
import { SelectionManager } from "../../../../presence/Interfaces/SelectionManager.js";
import {
	Menu,
	MenuItemRadio,
	MenuList,
	MenuPopover,
	MenuProps,
	MenuTrigger,
} from "@fluentui/react-menu";
import { ToolbarButton } from "@fluentui/react-toolbar";
import { Tooltip } from "@fluentui/react-tooltip";
import { useTree } from "../../../hooks/useTree.js";

/**
 * Ensure that all selected rows are still in the document.
 * If a row is not in the document, it will be removed from the selection.
 * @param table
 * @param selection
 */
const removeInvalidRows = (
	table: FluidTable,
	selection: SelectionManager<TypedSelection>
): void => {
	const selectedRows = selection.getLocalSelection().filter((s) => s.type === "row");

	for (const row of selectedRows) {
		const r = table.getRow(row.id);
		if (r === undefined || Tree.status(r) !== TreeStatus.InDocument) {
			// If the row is not in the document, remove it from the selection
			selection.removeFromSelection({ id: row.id, type: "row" });
		}
	}
};

/**
 * Get the last selected row from the table. If there are no selected rows,
 * returns undefined. If there are selected rows, it returns the last one.
 * @param table
 * @param selection
 * @returns FluidRow | undefined
 */
const getLastSelectedRow = (
	table: FluidTable,
	selection: SelectionManager<TypedSelection>
): FluidRow | undefined => {
	// Ensure that all selected rows are still in the document.
	// Remove any rows that are not in the document from the selection.
	removeInvalidRows(table, selection);

	// Get all selected rows from the selection manager.
	const selectedRows = selection.getLocalSelection().filter((s) => {
		return s.type === "row";
	});

	// If there are selected rows, return the last one
	if (selectedRows.length > 0) {
		const lastSelectedRow = table.getRow(selectedRows[selectedRows.length - 1].id);
		if (!lastSelectedRow) return undefined;
		return lastSelectedRow;
	} else {
		// If there are no selected rows, return undefined
		return undefined;
	}
};

export function NewEmptyRowButton(props: {
	table: FluidTable;
	selection: SelectionManager<TypedSelection>;
}): JSX.Element {
	const { table, selection } = props;

	useTree(table);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		const lastSelectedRow = getLastSelectedRow(table, selection);
		const row = table.createDetachedRow();
		if (lastSelectedRow !== undefined) {
			const rowIndex = table.rows.indexOf(lastSelectedRow);
			table.insertRows({ rows: [row], index: rowIndex + 1 });
		} else {
			table.insertRows({ rows: [row], index: table.rows.length });
		}
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<TableInsertRowRegular />}
			tooltip="Insert an empty row"
		/>
	);
}

export function NewRowButton(props: {
	table: FluidTable;
	selection: SelectionManager<TypedSelection>;
}): JSX.Element {
	const { table, selection } = props;
	useTree(table);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Wrap the add group operation in a transaction as it adds a group and potentially moves
		// multiple notes into the group and we want to ensure that the operation is atomic.
		// This ensures that the revertible of the operation will undo all the changes made by the operation.
		Tree.runTransaction(table, () => {
			const lastSelectedRow = getLastSelectedRow(table, selection);
			const row = table.createRowWithValues();

			if (lastSelectedRow !== undefined) {
				const rowIndex = table.rows.indexOf(lastSelectedRow);
				props.table.insertRows({ index: rowIndex + 1, rows: [row] });
			} else {
				props.table.insertRows({ index: props.table.rows.length, rows: [row] });
			}
		});
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<TableInsertRowFilled />}
			tooltip="Insert a new row with random values"
		/>
	);
}

export function NewManyRowsButton(props: { table: FluidTable }): JSX.Element {
	const { table } = props;
	useTree(table);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Wrap the add group operation in a transaction as it adds a group and potentially moves
		// multiple notes into the group and we want to ensure that the operation is atomic.
		// This ensures that the revertible of the operation will undo all the changes made by the operation.
		Tree.runTransaction(table, () => {
			// Add a thousand rows at a time
			const rows = [];
			for (let i = 0; i < 1000; i++) {
				const row = table.createRowWithValues();
				rows.push(row);
			}
			props.table.insertRows({ index: props.table.rows.length, rows });
		});
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<RowTripleFilled />}
			tooltip="Insert 1000 rows with random values"
		/>
	);
}

// (Removed - moved to FluidTable class as createRowWithValues method)

export function NewColumnButton(props: { table: FluidTable }): JSX.Element {
	const { table } = props;

	useTree(table);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		const index = props.table.columns.length + 1;
		const name = `Column ${index.toString()}`;

		// Add a new column to the table
		if (index % 5 === 1) {
			table.insertColumns({
				columns: [
					new FluidColumnSchema({
						id: crypto.randomUUID(),
						props: {
							name,
							hint: hintValues.string,
						},
					}),
				],
				index: table.columns.length,
			});
		} else if (index % 5 === 2) {
			table.insertColumns({
				columns: [
					new FluidColumnSchema({
						id: crypto.randomUUID(),
						props: {
							name,
							hint: hintValues.number,
						},
					}),
				],
				index: table.columns.length,
			});
		} else if (index % 5 === 3) {
			table.insertColumns({
				columns: [
					new FluidColumnSchema({
						id: crypto.randomUUID(),
						props: {
							name,
							hint: hintValues.boolean,
						},
					}),
				],
				index: table.columns.length,
			});
		} else if (index % 5 === 4) {
			table.insertColumns({
				columns: [
					new FluidColumnSchema({
						id: crypto.randomUUID(),
						props: {
							name,
							hint: hintValues.vote,
						},
					}),
				],
				index: table.columns.length,
			});
		} else {
			table.insertColumns({
				columns: [
					new FluidColumnSchema({
						id: crypto.randomUUID(),
						props: {
							name,
							hint: hintValues.date,
						},
					}),
				],
				index: table.columns.length,
			});
		}
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<ColumnFilled />}
			tooltip="Insert a new column with random type"
		/>
	);
}

export function MoveSelectedRowsButton(props: {
	table: FluidTable;
	selection: SelectionManager<TypedSelection>;
	up: boolean;
}): JSX.Element {
	const { table, selection, up } = props;

	useTree(table);

	// Use the unified event subscription utility for button state management
	const [disabled, setDisabled] = React.useState(true);
	useTableButtonState(selection, ["row"], setDisabled);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Get the selected rows from the selection manager
		const selectedRows = getSelected(selection, "row").map((s) => s.id);

		// If there are no selected rows, return
		if (selectedRows.length === 0) {
			return;
		}

		// Iterate through the selected rows and move them
		Tree.runTransaction(table, () => {
			for (const rowId of selectedRows) {
				const row = table.getRow(rowId);
				if (row !== undefined && Tree.status(row) === TreeStatus.InDocument) {
					const currentIndex = table.rows.indexOf(row);
					if (currentIndex === -1) continue;

					let newIndex: number;
					if (up) {
						newIndex = Math.max(0, currentIndex - 1);
					} else {
						newIndex = Math.min(table.rows.length - 1, currentIndex + 1);
					}

					if (newIndex !== currentIndex) {
						// Remove the row and re-insert it at the new position
						table.removeRows([row]);
						table.insertRows({ rows: [row], index: newIndex });
					}
				}
			}
		});
	};

	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={up ? <TableMoveAboveFilled /> : <TableMoveBelowFilled />}
			disabled={disabled}
			tooltip={up ? "Move selected rows up" : "Move selected rows down"}
		/>
	);
}

export function MoveSelectedColumnsButton(props: {
	table: FluidTable;
	selection: SelectionManager<TypedSelection>;
	left: boolean;
}): JSX.Element {
	const { table, selection, left } = props;

	useTree(table);

	// Use the unified event subscription utility for multi-type selection button state
	const [disabled, setDisabled] = React.useState(true);
	useTableButtonState(selection, ["column", "cell"], setDisabled);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Get the selected columns from the selection manager
		// convert the array to a mutable array
		const selectedColumns = getSelected(selection, "column").slice();

		// If there are no selected columns, check for
		// selected cells and move the column of the first selected cell
		if (selectedColumns.length === 0) {
			const selectedCells = getSelected(selection, "cell");
			if (selectedCells.length > 0) {
				const column = table.getColumnByCellId(
					selectedCells[0].id as `${string}_${string}`
				);
				if (column !== undefined && Tree.status(column) === TreeStatus.InDocument) {
					selectedColumns.push({ id: column.id, type: "column" });
				}
			}
		}

		Tree.runTransaction(table, () => {
			for (const c of selectedColumns) {
				const column = table.getColumn(c.id);
				if (column !== undefined && Tree.status(column) === TreeStatus.InDocument) {
					const currentIndex = table.columns.indexOf(column);
					if (currentIndex === -1) continue;

					let newIndex: number;
					if (left) {
						newIndex = Math.max(0, currentIndex - 1);
					} else {
						newIndex = Math.min(table.columns.length - 1, currentIndex + 1);
					}

					if (newIndex !== currentIndex) {
						// Remove the column and re-insert it at the new position
						table.removeColumns(currentIndex);
						table.insertColumns({ columns: [column], index: newIndex });
					}
				}
			}
		});
	};

	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={left ? <TableMoveLeftFilled /> : <TableMoveRightFilled />}
			disabled={disabled}
			tooltip={left ? "Move selected columns left" : "Move selected columns right"}
		/>
	);
}

export function DeleteSelectedRowsButton(props: {
	table: FluidTable;
	selection: SelectionManager<TypedSelection>;
}): JSX.Element {
	const { table, selection } = props;

	useTree(table);

	// Use the unified event subscription utility for button state management
	const [disabled, setDisabled] = React.useState(true);
	useTableButtonState(selection, ["row"], setDisabled);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Get the selected rows from the selection manager
		const selectedRows = getSelected(selection, "row").map((s) => s.id);

		// If there are no selected rows, return
		if (selectedRows.length === 0) {
			return;
		}

		// Create an array of rows to delete
		const rowsToDelete = selectedRows
			.map((rowId) => table.getRow(rowId))
			.filter((row): row is FluidRow => row !== undefined);
		table.removeRows(rowsToDelete);
		// Clear the selection
		selection.clearSelection();
	};

	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<TableDeleteRowFilled />}
			disabled={disabled}
			tooltip="Delete selected rows"
		/>
	);
}

// A menu that allows the user to change the column type
// The user can change the column type to a string, number, boolean, or date
export function ColumnTypeDropdown(props: { column: FluidColumn }): JSX.Element {
	const { column } = props;

	useTree(column);

	const [checkedValues, setCheckedValues] = React.useState<Record<string, string[]>>({
		type: [column.props.hint ?? ""],
	});
	const onChange: MenuProps["onCheckedValueChange"] = (
		e,
		{ name, checkedItems }: { name: string; checkedItems: string[] }
	) => {
		setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
	};

	// Note: The old column.cells.size check is no longer available, so we skip it for now
	if (column.getCells().length !== 0) return <></>;

	return (
		<Menu
			positioning={{ autoSize: true }}
			checkedValues={checkedValues}
			onCheckedValueChange={onChange}
		>
			<MenuTrigger disableButtonEnhancement>
				<ToolbarButton icon={<CaretDown16Filled />} />
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<ChangeColumnTypeMenuItem column={column} type={hintValues.string} />
					<ChangeColumnTypeMenuItem column={column} type={hintValues.number} />
					<ChangeColumnTypeMenuItem column={column} type={hintValues.boolean} />
					<ChangeColumnTypeMenuItem column={column} type={hintValues.date} />
					<ChangeColumnTypeMenuItem column={column} type={hintValues.vote} />
				</MenuList>
			</MenuPopover>
		</Menu>
	);
}

// Change the column type by setting the default value to a string, number, boolean, or date
export function ChangeColumnTypeMenuItem(props: {
	column: FluidColumn;
	type: HintValues;
}): JSX.Element {
	const { column, type } = props;

	useTree(column);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		switch (type) {
			case hintValues.string:
				column.props.hint = hintValues.string;
				break;
			case hintValues.number:
				column.props.hint = hintValues.number;
				break;
			case hintValues.boolean:
				column.props.hint = hintValues.boolean;
				break;
			case hintValues.date:
				column.props.hint = hintValues.date;
				break;
			case hintValues.vote:
				column.props.hint = hintValues.vote;
				break;
			default:
				column.props.hint = hintValues.string;
				break;
		}
	};

	return (
		<MenuItemRadio onClick={(e: React.MouseEvent) => handleClick(e)} name="type" value={type}>
			{type}
		</MenuItemRadio>
	);
}

// Delete all the rows in the table
export function DeleteAllRowsButton(props: { table: FluidTable }): JSX.Element {
	const { table } = props;
	useTree(table);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.table.removeRows([...props.table.rows]);
	};
	return (
		<TooltipButton
			onClick={(e: React.MouseEvent) => handleClick(e)}
			icon={<DismissFilled />}
			tooltip="Delete all rows"
		/>
	);
}

export function UndoButton(props: { undo: () => void }): JSX.Element {
	return <TooltipButton tooltip="Undo" onClick={() => props.undo()} icon={<ArrowUndoFilled />} />;
}

export function RedoButton(props: { redo: () => void }): JSX.Element {
	return <TooltipButton onClick={() => props.redo()} icon={<ArrowRedoFilled />} tooltip="Redo" />;
}

export function DeleteButton(props: { delete: () => void }): JSX.Element {
	return <IconButton onClick={() => props.delete()} icon={<DismissFilled />} grow={false} />;
}

export function TooltipButton(props: {
	onClick: (e: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	tooltip?: string;
	disabled?: boolean;
}): JSX.Element {
	const { children, tooltip } = props;

	return (
		<Tooltip content={tooltip ?? "No Tooltip Provided"} relationship="description">
			<ToolbarButton {...props}>{children}</ToolbarButton>
		</Tooltip>
	);
}

export function IconButton(props: {
	onClick: (value: React.MouseEvent) => void;
	children?: React.ReactNode;
	icon: JSX.Element;
	color?: string;
	background?: string;
	grow?: boolean;
	toggled?: boolean;
	toggleBackground?: string;
	toggleColor?: string;
	disabledColor?: string;
	disabledBackground?: string;
	disabled?: boolean;
	responsive?: boolean;
}): JSX.Element {
	const { onClick: handleClick, children, icon, disabled } = props;

	return (
		<ToolbarButton
			onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleClick(e)}
			disabled={disabled}
			icon={icon}
		>
			{children}
		</ToolbarButton>
	);
}

export function ButtonGroup(props: { children: React.ReactNode }): JSX.Element {
	return <div className="flex flex-intial items-center">{props.children}</div>;
}

export function Placeholder(): JSX.Element {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center hover:bg-black hover: text-white">
			<div className="h-12 w-12 rounded-full bg-gray-600"></div>
			<div className="h-6 w-24 rounded-md bg-gray-600 mt-2"></div>
		</div>
	);
}

const getSelected = (
	selection: SelectionManager<TypedSelection>,
	type: selectionType
): TypedSelection[] => {
	switch (type) {
		case "row":
			// Return the selected rows
			return selection.getLocalSelection().filter((s) => s.type === "row");
		case "column":
			// Return the selected columns
			return selection.getLocalSelection().filter((s) => s.type === "column");
		case "cell":
			// Return the selected cells
			return selection.getLocalSelection().filter((s) => s.type === "cell");
		default:
			// If the type is not recognized, return an empty array
			console.warn(`Unknown selection type: ${type}`);
			return [];
	}
};
