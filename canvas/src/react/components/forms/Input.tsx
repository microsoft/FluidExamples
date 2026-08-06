import React, { JSX } from "react";
import { DateTime, Vote, FluidRow, FluidColumn } from "../../../schema/appSchema.js";
import { Tree, TreeStatus } from "fluid-framework";
import { ThumbLikeFilled, ThumbLikeRegular } from "@fluentui/react-icons";
import { ToolbarButton } from "@fluentui/react-toolbar";
import { objectIdNumber, useTree } from "../../hooks/useTree.js";

export function ColumnInput(props: { column: FluidColumn }): JSX.Element {
	const { column } = props;
	useTree(column);
	return (
		<input
			id={column.id}
			className="outline-none w-full h-full truncate"
			value={column.props.name}
			onChange={(e) => {
				column.props.name = e.target.value;
			}}
		></input>
	);
}

// Input field for a cell with a boolean value
export function CellInputBoolean(props: {
	value: boolean;
	row: FluidRow;
	column: FluidColumn;
	cellId: string;
}): JSX.Element {
	const { value, row, column, cellId } = props;

	useTree(row, true);
	useTree(column);

	// Check if the cell is still in the row

	// handle a change event in the cell
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		row.setCell(column, e.target.checked);
	};

	return (
		// Layout the checkbox and label in a flex container and align the checkbox to the left
		<div key={objectIdNumber(row)} className="flex items-center w-full h-full p-1 ">
			<input
				id={cellId}
				className="outline-none w-4 h-4"
				type="checkbox"
				checked={value ?? false}
				onChange={handleChange}
			></input>
		</div>
	);
}

// Input field for a string cell
export function CellInputString(props: {
	value: string;
	row: FluidRow;
	column: FluidColumn;
	cellId: string;
}): JSX.Element {
	const { value, row, column, cellId } = props;

	useTree(row, true);
	useTree(column);

	// handle a change event in the cell
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		row.setCell(column, e.target.value);
	};

	return (
		<div key={objectIdNumber(row)}>
			<input
				id={cellId}
				className="outline-none w-full h-full"
				type="text"
				value={value ?? ""}
				onChange={handleChange}
			></input>
		</div>
	);
}

// Input field for a string cell
export function CellInputNumber(props: {
	value: number;
	row: FluidRow;
	column: FluidColumn;
	cellId: string;
}): JSX.Element {
	const { value, row, column, cellId } = props;

	useTree(row, true);
	useTree(column);

	// handle a change event in the cell
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// convert the value to a number
		const num = parseFloat(e.target.value);
		if (!isNaN(num)) {
			row.setCell(column, num);
		}
	};

	return (
		<input
			inputMode="numeric"
			id={cellId}
			className="outline-none w-full h-full"
			type="number"
			value={value ?? 0}
			onChange={handleChange}
		></input>
	);
}

export function CellInputDate(props: {
	value: DateTime | undefined;
	row: FluidRow;
	column: FluidColumn;
	cellId: string;
}): JSX.Element {
	const { value, row, column, cellId } = props;

	useTree(row, true);
	useTree(column);

	const date = value?.value?.toISOString().split("T")[0] ?? "";

	// handle a change event in the cell
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const fluidCell = row.getCell(column);
		// Test if the target value is a valid date
		if (isNaN(Date.parse(e.target.value))) {
			if (fluidCell !== undefined) {
				if (Tree.is(fluidCell, DateTime)) {
					row.removeCell(column);
					return;
				}
			}
		}
		// If the cell is undefined, initialize it with the new date
		// Otherwise, update the existing
		// Generate a new Date from the target value
		const d: Date = new Date(e.target.value);
		if (fluidCell === undefined) {
			row.setCell(column, new DateTime({ ms: d.getTime() }));
		} else {
			if (Tree.is(fluidCell, DateTime)) {
				fluidCell.value = d;
			}
		}
	};

	return (
		<input
			id={cellId}
			className="outline-none w-full h-full"
			type="date"
			value={date}
			onChange={handleChange}
		></input>
	);
}

// A control that allows users to vote by clicking a button in a cell
export function CellInputVote(props: {
	value: Vote | undefined;
	row: FluidRow;
	column: FluidColumn;
	userId: string;
}): JSX.Element {
	const { value, row, column, userId } = props;

	useTree(row, true);
	useTree(column);

	// Get the value of the cell
	const vote = value ?? new Vote({ votes: [] });

	// handle a click event in the cell
	const handleClick = () => {
		vote.toggleVote(userId);
		// Check if the vote object is in the table and that there are votes in it
		if (Tree.status(vote) !== TreeStatus.InDocument && vote.numberOfVotes > 0) {
			// If not, add it to the table
			row.setCell(column, vote);
		}
	};

	return (
		<div className="flex items-center justify-center w-full h-full">
			<ToolbarButton
				icon={vote.hasVoted(userId) ? <ThumbLikeFilled /> : <ThumbLikeRegular />}
				onClick={handleClick}
				appearance="transparent"
			>
				{vote.numberOfVotes.toString()}
			</ToolbarButton>
		</div>
	);
}
