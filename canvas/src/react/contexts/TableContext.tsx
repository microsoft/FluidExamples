/**
 * Table Context
 *
 * React context for managing the Fluid Framework table data structure
 * in the demo application. This context provides access to the collaborative
 * table data and ensures type-safe usage throughout the component tree.
 *
 * Key Features:
 * - Centralized access to the Fluid table data structure
 * - Type-safe table operations and data access
 * - Integration with Fluid Framework's tree data structure
 * - Document status validation to ensure data integrity
 * - Custom hook for convenient table access with error handling
 *
 * The context manages the FluidTable instance which contains all the
 * collaborative table data including rows, columns, cells, and their
 * real-time synchronization state.
 */

import { createContext, useContext } from "react";
import { FluidTable } from "../../schema/appSchema.js";
import { Tree, TreeStatus } from "fluid-framework";

/**
 * Type definition for the Table Context.
 * Contains the Fluid table instance and related state.
 */
interface TableContextType {
	/**
	 * The Fluid Framework table data structure containing all collaborative table data.
	 * Will be null until the table is properly initialized and loaded.
	 */
	table: FluidTable | null;
}

/**
 * React context for managing the Fluid table data structure.
 * Provides access to the collaborative table data throughout the component tree.
 *
 * Default value has table as null, which will be replaced with the actual
 * FluidTable instance when the TableContext.Provider is used.
 */
export const TableContext = createContext<TableContextType>({
	table: null,
});

/**
 * Custom hook for accessing the Fluid table with proper validation.
 * Ensures that the table is properly initialized and is part of the Fluid document
 * before allowing access to it.
 *
 * @returns The validated FluidTable instance
 * @throws Error if the table is not available or not properly initialized
 *
 * Use cases:
 * - Components that need to read table data
 * - Components that need to modify table structure or content
 * - Any operation requiring validated access to the collaborative table
 */
export const useTable = (): FluidTable => {
	const currentTableContext = useContext(TableContext);

	// Validate that the table exists and is properly integrated with Fluid Framework
	if (
		Tree.is(currentTableContext.table, FluidTable) &&
		Tree.status(currentTableContext.table) === TreeStatus.InDocument
	) {
		return currentTableContext.table;
	} else {
		throw new Error("TableContext is not a Fluid Table or is not in the document.");
	}
};
