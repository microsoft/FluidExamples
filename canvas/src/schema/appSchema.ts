/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TableSchema, SchemaFactoryAlpha } from "@fluidframework/tree/alpha";
import {
	SHAPE_MIN_SIZE,
	SHAPE_MAX_SIZE,
	SHAPE_SPAWN_MIN_SIZE,
	SHAPE_SPAWN_MAX_SIZE,
} from "../constants/shape.js";
import {
	TreeViewConfiguration,
	Tree,
	TreeNodeFromImplicitAllowedTypes,
	TreeStatus,
} from "fluid-framework";

export type HintValues = (typeof hintValues)[keyof typeof hintValues];
export const hintValues = {
	string: "string",
	number: "number",
	boolean: "boolean",
	date: "DateTime",
	vote: "Vote",
} as const;

// Schema is defined using a factory object that generates classes for objects as well
// as list and map nodes.

// Include a UUID to guarantee that this schema will be uniquely identifiable.
// As this schema uses a recursive type, the beta SchemaFactoryRecursive is used instead of just SchemaFactory.
const sf = new SchemaFactoryAlpha("fc1db2e8-0a00-11ee-be56-0242ac120002");

export class Shape extends sf.object("Shape", {
	size: sf.required(sf.number, {
		metadata: { description: "The width and height of the shape" },
	}),
	color: sf.required(sf.string, {
		metadata: {
			description: `The color of this shape, as a hexadecimal RGB string, e.g. "#00FF00" for bright green`,
		},
	}),
	type: sf.required(sf.string, {
		metadata: { description: `One of "circle", "square", "triangle", or "star"` },
	}),
}) {} // The size is a number that represents the size of the shape

/**
 * A SharedTree object date-time
 */
export class DateTime extends sf.object(hintValues.date, {
	ms: sf.required(sf.number, {
		metadata: { description: "The number of milliseconds since the epoch" },
	}),
}) {
	/**
	 * Get the date-time
	 */
	get value(): Date {
		return new Date(this.ms);
	}

	/**
	 * Set the raw date-time string
	 */
	set value(value: Date) {
		// Test if the value is a valid date
		if (isNaN(value.getTime())) {
			return;
		}
		this.ms = value.getTime();
	}
}

/**
 * A SharedTree object that allows users to vote
 */
export class Vote extends sf.object(hintValues.vote, {
	votes: sf.array(sf.string), // Map of votes
}) {
	/**
	 * Add a vote to the map of votes
	 * The key is the user id and the value is irrelevant
	 * @param vote The vote to add
	 */
	addVote(vote: string): void {
		if (this.votes.includes(vote)) {
			return;
		}
		this.votes.insertAtEnd(vote);
	}

	/**
	 * Remove a vote from the map of votes
	 * @param vote The vote to remove
	 */
	removeVote(vote: string): void {
		if (!this.votes.includes(vote)) {
			return;
		}
		const index = this.votes.indexOf(vote);
		this.votes.removeAt(index);
	}

	/**
	 * Toggle a vote in the map of votes
	 */
	toggleVote(vote: string): void {
		if (this.votes.includes(vote)) {
			this.removeVote(vote);
		} else {
			this.addVote(vote);
		}
	}

	/**
	 * Get the number of votes
	 * @returns The number of votes
	 */
	get numberOfVotes(): number {
		return this.votes.length;
	}

	/**
	 * Return whether the user has voted
	 * @param userId The user id
	 * @return Whether the user has voted
	 */
	hasVoted(userId: string): boolean {
		return this.votes.includes(userId);
	}
}
export class Comment extends sf.object("Comment", {
	id: sf.string,
	text: sf.string,
	userId: sf.required(sf.string, {
		metadata: {
			description: `A unique user id for the author of the node, or "AI Agent" if created by an agent`,
		},
	}),
	username: sf.required(sf.string, {
		metadata: {
			description: `A user-friendly name for the author of the node (e.g. "Alex Pardes"), or "AI Agent" if created by an agent`,
		},
	}),
	votes: Vote,
	createdAt: DateTime,
}) {
	delete(): void {
		const parent = Tree.parent(this);
		if (Tree.is(parent, Comments)) {
			parent.removeAt(parent.indexOf(this));
		}
	}
}

export class Comments extends sf.array("Comments", [Comment]) {
	addComment(text: string, userId: string, username: string): void {
		const comment = new Comment({
			id: crypto.randomUUID(),
			text,
			userId,
			username,
			votes: new Vote({ votes: [] }),
			createdAt: new DateTime({ ms: Date.now() }),
		});
		this.insertAtEnd(comment);
	}
}

export class Note extends sf.object(
	"Note",
	// Fields for Notes which SharedTree will store and synchronize across clients.
	// These fields are exposed as members of instances of the Note class.
	{
		id: sf.string,
		text: sf.string,
		author: sf.required(sf.string, {
			metadata: {
				description: `A unique user id for author of the node, or "AI Agent" if created by an agent`,
			},
		}),
	}
) {}

export type typeDefinition = TreeNodeFromImplicitAllowedTypes<typeof schemaTypes>;
const schemaTypes = [sf.string, sf.number, sf.boolean, DateTime, Vote] as const;

// Create column schema with properties for hint and name
export const FluidColumnSchema = TableSchema.column({
	schemaFactory: sf,
	cell: schemaTypes,
	props: sf.object("ColumnProps", {
		name: sf.string,
		hint: sf.optional(sf.string),
	}),
});

// Create row schema
export const FluidRowSchema = TableSchema.row({
	schemaFactory: sf,
	cell: schemaTypes,
});

// Create the built-in table schema
export class FluidTable extends TableSchema.table({
	schemaFactory: sf,
	cell: schemaTypes,
	column: FluidColumnSchema,
	row: FluidRowSchema,
}) {
	/**
	 * Create a Row before inserting it into the table
	 * */
	createDetachedRow(): FluidRow {
		return new FluidRowSchema({ id: crypto.randomUUID(), cells: {} });
	}

	/**
	 * Delete a column and all of its cells
	 * @param column The column to delete
	 */
	deleteColumn(column: FluidColumn): void {
		if (Tree.status(column) !== TreeStatus.InDocument) return;
		Tree.runTransaction(this, () => {
			// Remove all cells for this column from all rows
			for (const row of this.rows) {
				row.removeCell(column);
			}
			// Remove the column from the table
			const columnIndex = this.columns.indexOf(column);
			if (columnIndex !== -1) {
				this.removeColumns(columnIndex);
			}
		});
	}

	/**
	 * Get a column by cell ID (for backward compatibility)
	 * Cell IDs are typically in the format "columnId_rowId"
	 */
	getColumnByCellId(cellId: string): FluidColumn | undefined {
		// Extract column ID from cell ID (assuming format "columnId_rowId")
		const columnId = cellId.split("_")[0];
		return this.getColumn(columnId);
	}

	/**
	 * Add a new column to the table
	 */
	addColumn(): void {
		Tree.runTransaction(this, () => {
			const columnCount = this.columns.length;
			this.insertColumns({
				columns: [
					new FluidColumnSchema({
						id: crypto.randomUUID(),
						props: {
							name: `Column ${columnCount + 1}`,
							hint: hintValues.string,
						},
					}),
				],
				index: columnCount,
			});
		});
	}

	/**
	 * Add a new row to the table
	 */
	addRow(): void {
		Tree.runTransaction(this, () => {
			const newRow = { id: crypto.randomUUID(), cells: {} };
			this.insertRows({ rows: [newRow] });
		});
	}

	/**
	 * Move a column to the left (swap with the column to its left)
	 */
	moveColumnLeft(column: FluidColumn): boolean {
		const currentIndex = this.columns.indexOf(column);
		if (currentIndex <= 0) return false;
		this.columns.moveToIndex(currentIndex - 1, currentIndex);
		return true;
	}

	/**
	 * Move a column to the right (swap with the column to its right)
	 */
	moveColumnRight(column: FluidColumn): boolean {
		const currentIndex = this.columns.indexOf(column);
		if (currentIndex < 0 || currentIndex >= this.columns.length - 1) return false;
		this.columns.moveToIndex(currentIndex + 2, currentIndex);
		return true;
	}

	/**
	 * Move a row up (swap with the row above it)
	 */
	moveRowUp(row: FluidRow): boolean {
		const currentIndex = this.rows.indexOf(row);
		if (currentIndex <= 0) return false;
		this.rows.moveToIndex(currentIndex - 1, currentIndex);
		return true;
	}

	/**
	 * Move a row down (swap with the row below it)
	 */
	moveRowDown(row: FluidRow): boolean {
		const currentIndex = this.rows.indexOf(row);
		if (currentIndex < 0 || currentIndex >= this.rows.length - 1) return false;
		this.rows.moveToIndex(currentIndex + 2, currentIndex);
		return true;
	}

	/**
	 * Create a row with random values based on column types
	 */
	createRowWithValues(): FluidRow {
		const row = this.createDetachedRow();
		// Iterate through all the columns and add a random value for the new row
		for (const column of this.columns) {
			const fluidColumn = this.getColumn(column.id);
			if (!fluidColumn) continue;

			const hint = fluidColumn.props.hint;

			switch (hint) {
				case hintValues.string:
					row.setCell(fluidColumn, Math.random().toString(36).substring(7));
					break;
				case hintValues.number:
					row.setCell(fluidColumn, Math.floor(Math.random() * 1000));
					break;
				case hintValues.boolean:
					row.setCell(fluidColumn, Math.random() > 0.5);
					break;
				case hintValues.date: {
					// Add a random date
					const startDate = new Date(2020, 0, 1);
					const endDate = new Date();
					const date = this.getRandomDate(startDate, endDate);
					const dateTime = new DateTime({ ms: date.getTime() });
					row.setCell(fluidColumn, dateTime);
					break;
				}
				case hintValues.vote:
					break;
				default: // Add a random string
					row.setCell(fluidColumn, Math.random().toString(36).substring(7));
					break;
			}
		}
		return row;
	}

	/**
	 * Generate a random date between two dates
	 */
	private getRandomDate(start: Date, end: Date): Date {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}
}
export class Item extends sf.object("Item", {
	id: sf.string,
	x: sf.required(sf.number, {
		metadata: {
			description:
				"The x-coordinate of the shape on the canvas. The visible portion of the canvas width on a user's screen typically spans a few thousand pixels",
		},
	}),
	y: sf.required(sf.number, {
		metadata: {
			description:
				"The y-coordinate of the shape on the canvas. The visible portion of the canvas height on a user's screen typically spans a couple thousand pixels",
		},
	}),
	rotation: sf.required(sf.number, {
		metadata: {
			description: "The rotation of the shape in clockwise degrees",
		},
	}),
	comments: Comments,
	votes: Vote,
	content: [Shape, Note, FluidTable],
}) {
	delete(): void {
		const parent = Tree.parent(this);
		if (Tree.is(parent, Items)) {
			parent.removeAt(parent.indexOf(this));
		}
	}
}

// Simple Items array containing only Item objects
export class Items extends sf.array("Items", [Item]) {
	/**
	 * Create a new shape item and add it to the items collection
	 */
	createShapeItem(
		shapeType: "circle" | "square" | "triangle" | "star",
		canvasSize: { width: number; height: number },
		shapeColors: string[]
	): Item {
		// Spawn within a moderate sub-range so new shapes aren't extreme
		const maxSize = Math.min(SHAPE_SPAWN_MAX_SIZE, SHAPE_MAX_SIZE);
		const minSize = Math.max(SHAPE_SPAWN_MIN_SIZE, SHAPE_MIN_SIZE);

		const shape = new Shape({
			size: this.getRandomNumber(minSize, maxSize),
			color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
			type: shapeType,
		});

		const item = new Item({
			id: crypto.randomUUID(),
			x: this.getRandomNumber(0, canvasSize.width - maxSize - minSize),
			y: this.getRandomNumber(0, canvasSize.height - maxSize - minSize),
			comments: [],
			votes: new Vote({ votes: [] }),
			content: shape,
			rotation:
				this.getRandomNumber(0, 1) === 0
					? this.getRandomNumber(0, 15)
					: this.getRandomNumber(345, 360),
		});

		this.insertAtEnd(item);
		return item;
	}

	/**
	 * Create a new note item and add it to the items collection
	 */
	createNoteItem(canvasSize: { width: number; height: number }, authorId: string): Item {
		const note = new Note({
			id: crypto.randomUUID(),
			text: "",
			author: authorId,
		});

		const item = new Item({
			id: crypto.randomUUID(),
			x: this.getRandomNumber(0, canvasSize.width - 200),
			y: this.getRandomNumber(0, canvasSize.height - 200),
			comments: [],
			votes: new Vote({ votes: [] }),
			content: note,
			rotation:
				this.getRandomNumber(0, 1) === 0
					? this.getRandomNumber(0, 15)
					: this.getRandomNumber(345, 360),
		});

		this.insertAtEnd(item);
		return item;
	}

	/**
	 * Create a new table item and add it to the items collection
	 */
	createTableItem(canvasSize: { width: number; height: number }): Item {
		const table = this.createDefaultTable();

		const item = new Item({
			id: crypto.randomUUID(),
			x: this.getRandomNumber(0, canvasSize.width - 200),
			y: this.getRandomNumber(0, canvasSize.height - 200),
			comments: [],
			votes: new Vote({ votes: [] }),
			content: table,
			rotation: 0,
		});

		this.insertAtEnd(item);
		return item;
	}

	/**
	 * Create a default table with basic columns
	 */
	createDefaultTable(): FluidTable {
		const rows = new Array(10).fill(null).map(() => {
			return new FluidRowSchema({ id: crypto.randomUUID(), cells: {} });
		});

		const columns = [
			new FluidColumnSchema({
				id: crypto.randomUUID(),
				props: {
					name: "String",
					hint: hintValues.string,
				},
			}),
			new FluidColumnSchema({
				id: crypto.randomUUID(),
				props: {
					name: "Number",
					hint: hintValues.number,
				},
			}),
			new FluidColumnSchema({
				id: crypto.randomUUID(),
				props: {
					name: "Date",
					hint: hintValues.date,
				},
			}),
		];

		return new FluidTable({
			rows: rows,
			columns: columns,
		});
	}

	/**
	 * Duplicate an existing item
	 */
	duplicateItem(item: Item, canvasSize: { width: number; height: number }): Item {
		// Calculate new position with offset
		const offsetX = 20;
		const offsetY = 20;

		let newX = item.x + offsetX;
		let newY = item.y + offsetY;

		if (newX > canvasSize.width - 200) {
			newX = item.x - offsetX;
		}
		if (newY > canvasSize.height - 200) {
			newY = item.y - offsetY;
		}

		// Allow negative coordinates; no clamping to 0

		// Create the appropriate content based on the original item's content type
		let duplicatedContent;

		if (Tree.is(item.content, Shape)) {
			duplicatedContent = new Shape({
				size: item.content.size,
				color: item.content.color,
				type: item.content.type,
			});
		} else if (Tree.is(item.content, Note)) {
			duplicatedContent = new Note({
				id: crypto.randomUUID(),
				text: item.content.text,
				author: item.content.author,
			});
		} else if (Tree.is(item.content, FluidTable)) {
			// Create new columns with new IDs and mapping
			const columnIdMapping: Record<string, string> = {};
			const newColumns = item.content.columns.map((col) => {
				const newColumnId = crypto.randomUUID();
				columnIdMapping[col.id] = newColumnId;
				return new FluidColumnSchema({
					id: newColumnId,
					props: {
						name: col.props.name,
						hint: col.props.hint,
					},
				});
			});

			// Create new rows with copied cell data
			const newRows = item.content.rows.map((row) => {
				const newRow = new FluidRowSchema({
					id: crypto.randomUUID(),
					cells: {},
				});

				// Copy cells to the new row
				const table = item.content as FluidTable;
				for (const column of table.columns) {
					const cell = row.getCell(column);
					if (cell !== undefined) {
						const newColumnId = columnIdMapping[column.id];
						const newColumn = newColumns.find((c) => c.id === newColumnId);
						if (newColumn) {
							newRow.setCell(newColumn, cell);
						}
					}
				}

				return newRow;
			});

			duplicatedContent = new FluidTable({
				rows: newRows,
				columns: newColumns,
			});
		} else {
			throw new Error("Unknown content type, cannot duplicate");
		}

		const duplicatedItem = new Item({
			id: crypto.randomUUID(),
			x: newX,
			y: newY,
			comments: [],
			votes: new Vote({ votes: [] }),
			content: duplicatedContent,
			rotation: item.rotation,
		});

		this.insertAtEnd(duplicatedItem);
		return duplicatedItem;
	}

	/**
	 * Generate a random number between min and max (inclusive)
	 */
	private getRandomNumber(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Move an item forward one position (higher z-order)
	 */
	moveItemForward(item: Item): boolean {
		const itemIndex = this.indexOf(item);
		if (itemIndex < 0 || itemIndex >= this.length - 1) return false;

		Tree.runTransaction(this, () => {
			this.moveToIndex(itemIndex, itemIndex + 1);
		});
		return true;
	}

	/**
	 * Move an item backward one position (lower z-order)
	 */
	moveItemBackward(item: Item): boolean {
		const itemIndex = this.indexOf(item);
		if (itemIndex <= 0) return false;

		Tree.runTransaction(this, () => {
			this.moveToIndex(itemIndex - 1, itemIndex);
		});
		return true;
	}

	/**
	 * Bring an item to the front (highest z-order)
	 */
	bringItemToFront(item: Item): boolean {
		const itemIndex = this.indexOf(item);
		if (itemIndex < 0 || itemIndex >= this.length - 1) return false;

		Tree.runTransaction(this, () => {
			this.moveToEnd(itemIndex);
		});
		return true;
	}

	/**
	 * Send an item to the back (lowest z-order)
	 */
	sendItemToBack(item: Item): boolean {
		const itemIndex = this.indexOf(item);
		if (itemIndex <= 0) return false;

		Tree.runTransaction(this, () => {
			this.moveToStart(itemIndex);
		});
		return true;
	}
}

// ---- Ink (extended vector) schema definitions ----
export class InkPoint extends sf.object("InkPoint", {
	x: sf.number,
	y: sf.number,
	t: sf.optional(sf.number), // timestamp (ms since epoch or stroke start)
	p: sf.optional(sf.number), // pressure 0..1
}) {}

export class InkStyle extends sf.object("InkStyle", {
	strokeColor: sf.string,
	strokeWidth: sf.number,
	opacity: sf.number,
	lineCap: sf.string, // e.g. round | butt | square
	lineJoin: sf.string, // e.g. round | miter | bevel
}) {}

export class InkBBox extends sf.object("InkBBox", {
	x: sf.number,
	y: sf.number,
	w: sf.number,
	h: sf.number,
}) {}

export class InkStroke extends sf.object("InkStroke", {
	id: sf.string,
	points: sf.array([InkPoint]),
	style: InkStyle,
	bbox: InkBBox,
	simplified: sf.optional(sf.array([InkPoint])),
}) {}

export class App extends sf.object("App", {
	items: Items,
	comments: Comments,
	inks: sf.array([InkStroke]),
}) {}

export type FluidRow = InstanceType<typeof FluidRowSchema>;
export type FluidColumn = InstanceType<typeof FluidColumnSchema>;

/**
 * Export the tree config appropriate for this schema.
 * This is passed into the SharedTree when it is initialized.
 * */
export const appTreeConfiguration = new TreeViewConfiguration(
	// Schema for the root
	{ schema: App }
);
