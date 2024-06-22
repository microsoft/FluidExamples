/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration, SchemaFactory } from "fluid-framework";

// Define a schema factory that is used to generate classes for the schema
const sf = new SchemaFactory("d302b84c-75f6-4ecd-9663-524f467013e3");

// Define a class that is an array of strings
// This class is used to create an array in the SharedTree
export class StringArray extends sf.array("StringArray", sf.string) {
	/**
	 * Remove the first item in the list if the list is not empty
	 */
	public removeFirst = () => {
		if (this.length > 0) this.removeAt(0);
	};

	/**
	 * Add an item to the beginning of the list
	 */
	public insertNew = () => {
		this.insertAtStart("");
	};
}

// This object is passed into the SharedTree via the schematize method.
export const treeConfiguration = new TreeViewConfiguration(
	// Specify the root type - StringArray.
	{ schema: StringArray },
);
