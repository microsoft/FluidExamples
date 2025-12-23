/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ColumnDef,
	createColumnHelper,
	useReactTable,
	getCoreRowModel,
	Table,
	Header,
	Row,
	Cell,
	getSortedRowModel,
	SortingFnOption,
	SortDirection,
	Column,
	SortingFn,
} from "@tanstack/react-table";
import React, { JSX, useState, useContext, useMemo } from "react";
import {
	DateTime,
	Vote,
	FluidTable,
	FluidRow,
	FluidColumn,
	typeDefinition,
	hintValues,
} from "../../../schema/appSchema.js";
import { Tree, TreeStatus } from "fluid-framework";
import { useVirtualizer, VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { ColumnTypeDropdown, IconButton } from "../toolbar/buttons/TableButtons.js";
import { DeleteButton } from "../toolbar/buttons/EditButtons.js";
import {
	ArrowSortDownFilled,
	ArrowSortFilled,
	ArrowSortUpFilled,
	ReOrderDotsVertical16Filled,
} from "@fluentui/react-icons";
import { selectionType } from "../../../presence/selection.js";
import {
	CellInputBoolean,
	CellInputNumber,
	CellInputString,
	CellInputDate,
	CellInputVote,
	ColumnInput,
} from "../forms/Input.js";
import { PresenceContext } from "../../contexts/PresenceContext.js";
import { objectIdNumber, useTree } from "../../hooks/useTree.js";
import { usePresenceManager } from "../../hooks/usePresenceManger.js";
import { TableContext, useTable } from "../../contexts/TableContext.js";

/**
 * Layout Constants
 *
 * Defines consistent column widths throughout the table component.
 * These ensure proper alignment between headers and body cells.
 */
const leftColumnWidth = "20px"; // Width of the index column (row numbers)
const columnWidth = "200px"; // Width of data columns (consistent sizing)

/**
 * TableView Component
 *
 * A collaborative data table component built with TanStack Table and Fluid Framework.
 * Supports real-time collaboration, virtual scrolling, column sorting, and presence indicators.
 *
 * Key Features:
 * - Real-time collaborative editing with Fluid Framework
 * - Virtual scrolling for performance with large datasets
 * - Column sorting and type management (string, number, boolean, date, vote)
 * - Live presence indicators showing where other users are working
 * - Optimized re-rendering using memoization and tree change monitoring
 *
 * Architecture:
 * - Uses a single useTree hook to monitor all table changes efficiently
 * - Memoizes data and column configurations to prevent unnecessary re-renders
 * - Separates concerns: TableView (main), TableHeadersView (headers), TableBodyView (body)
 */
export function TableView(props: { fluidTable: FluidTable }): JSX.Element {
	const { fluidTable } = props;

	/**
	 * Tree Change Monitoring
	 *
	 * Uses a single useTree hook with deep=true to monitor the entire table structure.
	 * This approach is more efficient than multiple hooks and prevents cascading re-renders.
	 * The invalidation counter increments whenever any part of the table changes:
	 * - Table structure changes
	 * - Row additions/deletions/modifications
	 * - Column additions/deletions/modifications
	 * - Cell value changes
	 */
	const invalTable = useTree(fluidTable, true);

	/**
	 * Fluid Framework Status Validation
	 *
	 * Ensures the table is properly connected to the Fluid container.
	 * If not in document, the table data may not be available or synchronized.
	 */
	if (Tree.status(fluidTable) !== TreeStatus.InDocument) {
		console.error("Fluid table not in document");
		return <div className="p-4 text-red-600">Table not available</div>;
	}

	/**
	 * Data Preparation with Memoization
	 *
	 * Converts Fluid Framework TreeArrayNodes to regular JavaScript arrays
	 * that TanStack Table can work with. Memoized to prevent unnecessary
	 * re-computations unless the table structure actually changes.
	 */
	const data = useMemo(() => Array.from(fluidTable.rows), [invalTable]);
	const columns = useMemo(() => updateColumnData(Array.from(fluidTable.columns)), [invalTable]);

	/**
	 * Table Container Reference
	 *
	 * Required by TanStack Virtual for measuring the scrollable container.
	 * Used to calculate which rows should be rendered in the viewport.
	 */
	const tableContainerRef = React.useRef<HTMLDivElement>(null);

	/**
	 * TanStack Table Instance
	 *
	 * Configures the table with:
	 * - data: Array of FluidRow objects (memoized from Fluid tree)
	 * - columns: Column definitions with accessors and sorting (memoized)
	 * - getRowId: Uses FluidRow.id for stable row identification
	 * - getCoreRowModel: Basic table functionality
	 * - getSortedRowModel: Enables column sorting
	 */
	const table = useReactTable({
		data,
		columns,
		getRowId: (originalRow) => originalRow.id,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(), //provide a sorting row model
	});

	return (
		/* 
			TableContext provides the FluidTable instance to all child components.
			This enables header and cell components to access table methods like
			getColumn(), deleteColumn(), etc. without prop drilling.
		*/
		<TableContext.Provider value={{ table: fluidTable }}>
			{/* 
				Main table container with overflow handling.
				The table uses CSS Grid display for consistent column sizing
				and virtualization support.
			*/}
			<div ref={tableContainerRef} className="overflow-auto mx-auto h-full w-full relative">
				<table
					style={{ display: "grid" }}
					className="table-auto w-full border-collapse border-b-2 border-gray-200"
				>
					<TableHeadersView table={table} />
					<TableBodyView table={table} tableContainerRef={tableContainerRef} />
				</table>
			</div>
		</TableContext.Provider>
	);
}

/**
 * TableHeadersView Component
 *
 * Renders the sticky table header row containing column headers.
 * Uses CSS Grid layout to align with the table body columns.
 * The header remains fixed at the top during scrolling.
 */
export function TableHeadersView(props: { table: Table<FluidRow> }): JSX.Element {
	const { table } = props;

	return (
		<thead
			style={{
				display: "grid",
				zIndex: 4, // Ensures header stays above body content when scrolling
			}}
			className="bg-gray-200 sticky top-0 min-h-[36px] w-full inline-flex items-center shadow-sm z-2"
		>
			{table.getHeaderGroups().map((headerGroup) => (
				<tr style={{ display: "flex", width: "100%" }} key={headerGroup.id}>
					{headerGroup.headers.map((header) =>
						header.id === "index" ? (
							<IndexHeaderView key="index" />
						) : (
							<TableHeaderView key={header.id} header={header} />
						)
					)}
				</tr>
			))}
		</thead>
	);
}

/**
 * IndexHeaderView Component
 *
 * Renders the leftmost header cell for the row index column.
 * This column shows row numbers and doesn't contain any interactive elements.
 */
export function IndexHeaderView(): JSX.Element {
	return (
		<th
			style={{
				display: "flex",
				minWidth: leftColumnWidth,
				width: leftColumnWidth,
			}}
			className="p-1"
		></th>
	);
}

/**
 * TableHeaderView Component
 *
 * Renders an individual column header with full collaborative editing capabilities.
 *
 * Features:
 * - Column name editing (ColumnInput)
 * - Column type selection (ColumnTypeDropdown)
 * - Sorting controls (SortButton)
 * - Column deletion (DeleteButton)
 * - Presence indicators showing where other users are working
 * - Error handling for missing/invalid columns
 *
 * The component maintains its own tree subscription to the FluidColumn
 * to ensure updates when column properties change.
 */
export function TableHeaderView(props: { header: Header<FluidRow, unknown> }): JSX.Element {
	const { header } = props;
	const fluidTable = useTable(); // Get the fluid table from context

	/**
	 * Column Resolution with Error Handling
	 *
	 * Attempts to find the FluidColumn object corresponding to this header.
	 * Memoized to prevent repeated lookups on each render.
	 * If the column is not found, displays an error state.
	 */
	const fluidColumn = useMemo(() => {
		try {
			return fluidTable.getColumn(header.id);
		} catch (e) {
			console.error("Fluid column not found", header.id);
			return null;
		}
	}, [fluidTable, header.id]);

	// Early return with error state if column not found
	if (!fluidColumn) {
		return (
			<th
				style={{
					display: "flex",
					minWidth: columnWidth,
					width: columnWidth,
					maxWidth: columnWidth,
				}}
				className="relative p-1 border-r-1 border-gray-100 bg-red-100"
			>
				<div className="text-red-600 text-xs">Column Error</div>
			</th>
		);
	}

	/**
	 * Column-Specific Tree Monitoring
	 *
	 * Subscribes to changes in this specific column's properties
	 * (name, type, etc.) to trigger re-renders when needed.
	 */
	useTree(fluidColumn);
	const selection = useContext(PresenceContext).tableSelection;

	/**
	 * Focus Handler for Presence
	 *
	 * When a user interacts with this column header, it updates their
	 * presence state so other users can see where they're working.
	 */
	const handleFocus = () => {
		// set the selection to the column
		selection.setSelection({ id: fluidColumn.id, type: "column" });
	};

	return (
		<th
			style={{
				display: "flex",
				minWidth: columnWidth,
				width: columnWidth,
				maxWidth: columnWidth,
			}}
			className="relative p-1 border-r-1 border-gray-100"
			onFocus={handleFocus}
			onClick={(e) => {}}
		>
			<PresenceIndicator item={header} type="column" /> {/* Local selection box */}
			<PresenceIndicator item={header} type="column" /> {/* Remote selection box */}
			<div className="flex flex-row justify-between w-full gap-x-1">
				<ColumnInput column={fluidColumn} /> {/* Input field for the column name */}
				<ColumnTypeDropdown column={fluidColumn} />
				<SortButton column={header.column} />
				<DeleteButton
					delete={() => {
						header.column.clearSorting();
						fluidTable.deleteColumn(fluidColumn);
					}}
				/>
			</div>
		</th>
	);
}

export function SortButton(props: { column: Column<FluidRow> }): JSX.Element {
	const { column } = props;

	// Use column.getIsSorted() directly instead of local state
	const sorted = column.getIsSorted();

	const handleClick = (e: React.MouseEvent) => {
		const sortingFn = column.getToggleSortingHandler();
		if (sortingFn) {
			sortingFn(e);
		}
	};

	return (
		<IconButton
			onClick={handleClick}
			icon={<SortIndicator sorted={sorted} />}
			toggled={sorted !== false}
		/>
	);
}

export function SortIndicator(props: { sorted: false | SortDirection }): JSX.Element {
	const { sorted } = props;
	if (sorted === "asc") {
		return <ArrowSortUpFilled />;
	} else if (sorted === "desc") {
		return <ArrowSortDownFilled />;
	} else {
		return <ArrowSortFilled />;
	}
}

export function TableBodyView(props: {
	table: Table<FluidRow>;
	tableContainerRef: React.RefObject<HTMLDivElement | null>;
}): JSX.Element {
	const { table, tableContainerRef } = props;
	const { rows } = table.getRowModel();

	const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
		count: rows.length,
		estimateSize: () => 36, //estimate row height for accurate scrollbar dragging
		getScrollElement: () => tableContainerRef.current,
		// Disable dynamic measurement to avoid nested updates when the canvas pans
		measureElement: undefined,
		overscan: 5,
	});

	return (
		<tbody
			id="tableBody"
			style={{
				display: "grid",
				height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
				position: "relative", //needed for absolute positioning of rows
			}}
		>
			{rowVirtualizer.getVirtualItems().map((virtualRow) => {
				const row = rows[virtualRow.index] as Row<FluidRow>;
				return (
					<TableRowView
						key={row.id}
						row={row}
						virtualRow={virtualRow}
						rowVirtualizer={rowVirtualizer}
					/>
				);
			})}
		</tbody>
	);
}

export function TableRowView(props: {
	row: Row<FluidRow>;
	virtualRow: VirtualItem;
	rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}): JSX.Element {
	const { row, virtualRow } = props;
	const fluidTable = useTable();

	const style = { transform: `translateY(${virtualRow.start}px)` };

	// Get the fluid row - use useMemo for better performance
	const fluidRow = useMemo(() => {
		const foundRow = fluidTable.getRow(row.id);
		if (!foundRow) {
			console.error("Fluid row not found", row.id);
		}
		return foundRow;
	}, [fluidTable, row.id]);

	// Early return with error state if row not found
	if (!fluidRow) {
		return (
			<tr
				style={{
					...style,
					display: "flex",
					position: "absolute",
					width: "100%",
					height: `${virtualRow.size}px`,
				}}
				className="bg-red-100"
			>
				<td className="p-2 text-red-600">Row Error: {row.id}</td>
			</tr>
		);
	}

	useTree(fluidRow);

	return (
		<tr
			key={objectIdNumber(fluidRow)}
			data-index={virtualRow.index} //needed for dynamic row height measurement
			style={{
				...style,
				display: "flex",
				position: "absolute",
				width: "100%",
				height: `${virtualRow.size}px`,
			}}
			className={`w-full even:bg-white odd:bg-gray-100`}
		>
			<PresenceIndicator item={row} type="row" />
			{/* Local selection box */}
			{row.getVisibleCells().map((cell) =>
				cell.column.id === "index" ? (
					<IndexCellView key="index" rowId={row.id} />
				) : (
					<TableCellView
						key={cell.id}
						cell={cell as Cell<FluidRow, cellValue>}
						{...props} // Pass the user prop to the TableCellView
					/>
				)
			)}
		</tr>
	);
}

export function IndexCellView(props: { rowId: string }): JSX.Element {
	const { rowId } = props;

	const selection = useContext(PresenceContext).tableSelection; // Get the selection manager from context

	// handle a click event in the cell
	const handleClick = (e: React.MouseEvent) => {
		if (e.ctrlKey) {
			selection.toggleSelection({ id: rowId, type: "row" });
		} else {
			if (selection.testSelection({ id: rowId, type: "row" })) {
				// If the row is already selected, clear the selection
				selection.clearSelection();
			} else {
				// If the row is not selected, add the selection
				selection.setSelection({ id: rowId, type: "row" });
			}
		}
	};

	return (
		// Center the div in the cell and center the icon in the div
		<td
			onClick={(e) => handleClick(e)}
			style={{
				display: "flex",
				minWidth: leftColumnWidth,
				width: leftColumnWidth,
			}}
			className="bg-gray-200 hover:bg-gray-400 border-collapse z-0"
		>
			<div
				className={`flex w-full h-full justify-center items-center text-gray-400 hover:text-gray-800`}
			>
				<ReOrderDotsVertical16Filled />
			</div>
		</td>
	);
}

export function TableCellView(props: { cell: Cell<FluidRow, cellValue> }): JSX.Element {
	const { cell } = props;

	const selection = useContext(PresenceContext).tableSelection; // Get the selection manager from context

	// handle a click event in the cell
	const handleFocus = (e: React.FocusEvent) => {
		selection.setSelection({ id: cell.id, type: "cell" });
	};

	return (
		<td
			onClick={(e) => {}}
			onFocus={(e) => handleFocus(e)}
			style={{
				display: "flex",
				position: "relative",
				minWidth: columnWidth,
				width: columnWidth,
				maxWidth: columnWidth,
			}}
			className={`flex p-1 border-collapse border-r-2`}
		>
			<PresenceIndicator item={cell} type="cell" />
			<TableCellViewContent key={cell.id} cell={cell} />
		</td>
	);
}

export function TableCellViewContent(props: { cell: Cell<FluidRow, cellValue> }): JSX.Element {
	const { cell } = props;
	const fluidTable = useTable();

	// Get fluid row and column with proper error handling
	const fluidRow = useMemo(() => {
		const row = fluidTable.getRow(cell.row.id);
		if (!row) {
			console.error("Fluid row not found", cell.row.id);
		}
		return row;
	}, [fluidTable, cell.row.id]);

	const fluidColumn = useMemo(() => {
		try {
			return fluidTable.getColumn(cell.column.id);
		} catch (e) {
			console.error("Fluid column not found", cell.column.id);
			return null;
		}
	}, [fluidTable, cell.column.id]);

	// Early return for missing data
	if (!fluidRow || !fluidColumn) {
		return <div className="text-red-500 text-xs p-1">Cell Error</div>;
	}

	const value = fluidRow.getCell(fluidColumn);
	useTree(fluidRow, true);
	useTree(fluidColumn);
	const users = useContext(PresenceContext).users;

	// Switch on the hint of the column to determine the type of input to display
	switch (fluidColumn.props.hint) {
		case "boolean":
			return (
				<CellInputBoolean
					value={value as boolean}
					row={fluidRow}
					column={fluidColumn}
					cellId={cell.id}
				/>
			);
		case "number":
			return (
				<CellInputNumber
					value={value as number}
					row={fluidRow}
					column={fluidColumn}
					cellId={cell.id}
				/>
			);
		case "string":
			return (
				<CellInputString
					value={value as string}
					row={fluidRow}
					column={fluidColumn}
					cellId={cell.id}
				/>
			);
		case "DateTime":
			return (
				<CellInputDate
					key={objectIdNumber(fluidRow)}
					value={value as DateTime}
					row={fluidRow}
					column={fluidColumn}
					cellId={cell.id}
				/>
			);
		case "Vote":
			return (
				<CellInputVote
					key={objectIdNumber(fluidRow)}
					value={value as Vote}
					row={fluidRow}
					column={fluidColumn}
					userId={users.getMyself().value.id} // Replace with actual user ID from context or props
				/>
			);
		default:
			// If the value is undefined, make it a string
			return (
				<CellInputString
					key={objectIdNumber(fluidRow)}
					value={value as string}
					row={fluidRow}
					column={fluidColumn}
					cellId={cell.id}
				/>
			);
	}
}

export function PresenceIndicator(props: {
	item: Cell<FluidRow, cellValue> | Header<FluidRow, unknown> | Row<FluidRow>;
	type: selectionType;
}): JSX.Element {
	const { item, type } = props;
	const selectedItem = { id: item.id, type } as const;
	const selection = useContext(PresenceContext).tableSelection;

	// Use a single state object to reduce complexity
	const [selectionState, setSelectionState] = useState(() => ({
		isSelected: selection.testSelection(selectedItem),
		remoteSelected: selection.testRemoteSelection(selectedItem),
	}));

	// Single presence manager hook with consolidated state updates
	usePresenceManager(
		selection,
		() => {
			// Remote update
			setSelectionState((prev) => ({
				...prev,
				remoteSelected: selection.testRemoteSelection(selectedItem),
			}));
		},
		() => {
			// Local update
			setSelectionState((prev) => ({
				...prev,
				isSelected: selection.testSelection(selectedItem),
			}));
		},
		() => {
			// Disconnect - refresh both states
			setSelectionState({
				isSelected: selection.testSelection(selectedItem),
				remoteSelected: selection.testRemoteSelection(selectedItem),
			});
		}
	);

	const isRow = type === "row";

	return (
		<>
			<PresenceBox
				color="outline-blue-600"
				hidden={!selectionState.isSelected}
				isRow={isRow}
			/>
			<PresenceBox
				color="outline-red-800"
				hidden={selectionState.remoteSelected.length === 0}
				isRow={isRow}
			/>
		</>
	);
}

function PresenceBox(props: { color: string; hidden: boolean; isRow: boolean }): JSX.Element {
	const { color, hidden, isRow } = props;
	const className = `pointer-events-none absolute z-1 h-full w-full inset-0 pointer-events-none outline-2 -outline-offset-2
	${hidden ? "hidden" : ""} ${color} opacity-50`;
	if (isRow) {
		return <td className={className}></td>;
	} else {
		return <span className={className}></span>;
	}
}

export type cellValue = typeDefinition; // Define the allowed cell value types

/**
 * updateColumnData Function
 *
 * Converts FluidColumn objects into TanStack Table ColumnDef configurations.
 * This function is called whenever the table's column structure changes.
 *
 * Process:
 * 1. Creates a column helper for type-safe column definitions
 * 2. Adds the special "index" column for row numbers
 * 3. Converts each FluidColumn into a ColumnDef with:
 *    - Unique ID from FluidColumn.id
 *    - Header text from FluidColumn.props.name
 *    - Data accessor that calls row.getCell(column)
 *    - Appropriate sorting function based on column type
 *
 * @param columnsArray - Array of FluidColumn objects from the table schema
 * @returns Array of ColumnDef objects for TanStack Table
 */
const updateColumnData = (columnsArray: FluidColumn[]) => {
	// Create a column helper for type-safe column definition creation
	const columnHelper = createColumnHelper<FluidRow>();

	// Initialize array with column definitions
	const headerArray: ColumnDef<FluidRow, cellValue>[] = [];

	/**
	 * Index Column
	 *
	 * Special display-only column that shows row numbers.
	 * Uses TanStack Table's display column type since it doesn't access data.
	 */
	const indexColumn = columnHelper.display({
		id: "index",
	});
	headerArray.push(indexColumn);

	/**
	 * Data Columns
	 *
	 * Convert each FluidColumn into a TanStack Table accessor column.
	 * Each column includes custom sorting logic based on its data type.
	 */
	columnsArray.forEach((column) => {
		const sortingConfig = getSortingConfig(column);
		headerArray.push(
			columnHelper.accessor((row) => row.getCell(column), {
				id: column.id, // Stable identifier for React keys and column management
				header: column.props.name, // Display name shown in header
				sortingFn: sortingConfig.fn, // Custom sorting based on column type
				sortDescFirst: sortingConfig.desc, // Whether to sort descending first
				sortUndefined: "last", // Always put undefined values at the end
			})
		);
	});

	return headerArray;
};

// Custom sorting function for DateTime objects because
// the default alphanumeric sorting function does not work
// because the data is accessed via a second layer of the object
const dateSortingFn: SortingFn<FluidRow> = (
	rowA: Row<FluidRow>,
	rowB: Row<FluidRow>,
	columnId: string
) => {
	const valueA = rowA.getValue(columnId) as { value: DateTime | undefined };
	const valueB = rowB.getValue(columnId) as { value: DateTime | undefined };
	if (valueA === undefined && valueB === undefined) {
		return 0;
	} else if (valueA === undefined || valueA.value === undefined) {
		return 1;
	} else if (valueB === undefined || valueB.value === undefined) {
		return -1;
	} else if (Tree.is(valueA, DateTime) && Tree.is(valueB, DateTime)) {
		const dateA = valueA.value;
		const dateB = valueB.value;
		if (dateA < dateB) {
			return -1;
		} else if (dateA > dateB) {
			return 1;
		} else {
			return 0;
		}
	}
	return 0;
};

// Custom sorting function for DateTime objects because
// the default alphanumeric sorting function does not work
// because the data is accessed via a second layer of the object
const voteSortingFn: SortingFn<FluidRow> = (
	rowA: Row<FluidRow>,
	rowB: Row<FluidRow>,
	columnId: string
) => {
	const valueA = rowA.getValue(columnId) as { value: Vote | undefined };
	const valueB = rowB.getValue(columnId) as { value: Vote | undefined };
	if (valueA === undefined && valueB === undefined) {
		return 0;
	} else if (valueA === undefined) {
		return 1;
	} else if (valueB === undefined) {
		return -1;
	} else if (Tree.is(valueA, Vote) && Tree.is(valueB, Vote)) {
		const dateA = valueA.numberOfVotes;
		const dateB = valueB.numberOfVotes;
		if (dateA < dateB) {
			return -1;
		} else if (dateA > dateB) {
			return 1;
		} else {
			return 0;
		}
	}
	return 0;
};

// Get the sorting function and sort direction for a column
const getSortingConfig = (
	column: FluidColumn // Column object with id, name, and hint properties
): { fn: SortingFnOption<FluidRow> | undefined; desc: boolean } => {
	if (column.props.hint === hintValues.boolean) {
		return { fn: "basic", desc: false };
	} else if (column.props.hint === hintValues.number) {
		return { fn: "alphanumeric", desc: true };
	} else if (column.props.hint === hintValues.string) {
		return { fn: "alphanumeric", desc: false };
	} else if (column.props.hint === hintValues.date) {
		return { fn: dateSortingFn, desc: false };
	} else if (column.props.hint === hintValues.vote) {
		return { fn: voteSortingFn, desc: true };
	} else {
		console.error("Unknown column type", "Hint:", column.props.hint);
		return { fn: "basic", desc: false };
	}
};
