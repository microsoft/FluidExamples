import { expect, test } from "@playwright/test";
import { createIndependentTreeViewAlpha } from "fluid-framework/alpha";
import { Tree } from "fluid-framework";
import { App, appTreeConfiguration, DateTime, FluidTable, Vote } from "../src/schema/appSchema.js";
import { createUndoRedoStacks } from "../src/undo/undo.js";

function createView() {
	const view = createIndependentTreeViewAlpha(appTreeConfiguration, {
		minVersionForCollab: "3.0.0",
	});
	view.initialize(new App({ items: [], comments: [], inks: [] }));
	return view;
}

test("table cells survive row/column moves and deleting just one column", () => {
	const view = createView();
	try {
		const item = view.root.items.createTableItem({ width: 1000, height: 800 });
		expect(Tree.is(item.content, FluidTable)).toBe(true);
		if (!Tree.is(item.content, FluidTable)) throw new Error("Expected a table");
		const table = item.content;
		const [row] = table.rows;
		const [text, number, date] = table.columns;
		table.setCell(row, text, "Keep me");
		table.setCell(row, number, 42);
		table.setCell(row, date, new DateTime({ ms: 1000 }));
		table.moveRowDown(row);
		table.moveColumnRight(text);
		expect(table.getCell({ row, column: text })).toBe("Keep me");
		expect(table.getColumnByCellId(`${row.id}_${text.id}`)).toBe(text);
		table.deleteColumn(number);
		expect(table.columns.length).toBe(2);
		expect(table.getCell({ row, column: text })).toBe("Keep me");
		expect(Tree.is(table.getCell({ row, column: date }), DateTime)).toBe(true);
	} finally {
		view.dispose();
	}
});

test("duplicating a table clones object-valued cells without stealing the originals", () => {
	const view = createView();
	try {
		const item = view.root.items.createTableItem({ width: 1000, height: 800 });
		if (!Tree.is(item.content, FluidTable)) throw new Error("Expected a table");
		const source = item.content;
		const row = source.rows[0];
		source.setCell(row, source.columns[0], new Vote({ votes: ["one", "two"] }));
		source.setCell(row, source.columns[2], new DateTime({ ms: 1000 }));
		const copied = view.root.items.duplicateItem(item, { width: 1000, height: 800 });
		if (!Tree.is(copied.content, FluidTable)) throw new Error("Expected a copied table");
		const table = copied.content;
		const vote = table.getCell({ row: table.rows[0], column: table.columns[0] });
		const date = table.getCell({ row: table.rows[0], column: table.columns[2] });
		if (!Tree.is(vote, Vote) || !Tree.is(date, DateTime))
			throw new Error("Missing copied cells");
		expect([...vote.votes]).toEqual(["one", "two"]);
		expect(date.ms).toBe(1000);
		expect(vote).not.toBe(source.getCell({ row, column: source.columns[0] }));
		vote.toggleVote("three");
		date.ms = 2000;
		const originalVote = source.getCell({ row, column: source.columns[0] });
		const originalDate = source.getCell({ row, column: source.columns[2] });
		if (!Tree.is(originalVote, Vote) || !Tree.is(originalDate, DateTime))
			throw new Error("Lost original cells");
		expect(originalVote.numberOfVotes).toBe(2);
		expect(originalDate.ms).toBe(1000);
	} finally {
		view.dispose();
	}
});

test("table creation, row insertion and deletion remain undoable transactions", () => {
	const view = createView();
	const history = createUndoRedoStacks(view.events);
	try {
		view.root.items.createTableItem({ width: 1000, height: 800 });
		expect(view.root.items.length).toBe(1);
		history.undo();
		expect(view.root.items.length).toBe(0);
		history.redo();
		const table = view.root.items[0].content;
		if (!Tree.is(table, FluidTable)) throw new Error("Expected a table");
		Tree.runTransaction(table, () => table.insertRows([table.createRowWithValues()]));
		expect(table.rows.length).toBe(11);
		history.undo();
		expect(table.rows.length).toBe(10);
		history.redo();
		expect(table.rows.length).toBe(11);
		const columnCount = table.columns.length;
		table.deleteColumn(table.columns[1]);
		expect(table.columns.length).toBe(columnCount - 1);
		history.undo();
		expect(table.columns.length).toBe(columnCount);
	} finally {
		history.dispose();
		view.dispose();
	}
});
