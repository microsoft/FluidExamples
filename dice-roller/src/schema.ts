/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration, SchemaFactory } from "fluid-framework";

// Define a schema factory that is used to generate classes for the schema
const schemaFactory = new SchemaFactory("d302b84c-75f6-4ecd-9663-524f467013e8");

export class DiceRoller extends schemaFactory.object("DiceRoller", {
	// value: schemaFactory.string
	value: schemaFactory.number
}) {
	public roll() {
		let newValue = -1;
		// while (newValue === parseInt(this.value, 10) || newValue === -1) {
		while (newValue === this.value || newValue === -1) {
			newValue = Math.floor(Math.random() * 6) + 1;
		}
		// this.value = newValue.toString();
		this.value = newValue;
	}
}

// This object is passed into the SharedTree via the schematize method.
export const treeConfiguration = new TreeViewConfiguration(
	// Specify the root type - our class.
	{ schema: DiceRoller }
);
