/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeConfiguration, SchemaFactoryRecursive, Tree } from "fluid-framework";
import { Guid } from "guid-typescript";

// Schema is defined using a factory object that generates classes for objects as well
// as list and map nodes.

// Include a UUID to guarantee that this schema will be uniquely identifiable.
// As this schema uses a recursive type, the beta SchemaFactoryRecursive is used instead of just SchemaFactory.
const sf = new SchemaFactoryRecursive("fc1db2e8-0a00-11ee-be56-0242ac120002");

// Define the schema for the note object.
// Helper functions for working with the data contained in this object
// are included in this class definition as methods.
export class Note extends sf.object(
	"Note",
	// Fields for Notes which SharedTree will store and synchronize across clients.
	// These fields are exposed as members of instances of the Note class.
	{
		/**
		 * Id to make building the React app simpler.
		 */
		id: sf.string,
		text: sf.string,
		author: sf.string,
		/**
		 * Sequence of user ids to track which users have voted on this note.
		 */
		votes: sf.array(sf.string),
		created: sf.number,
		lastChanged: sf.number,
	},
) {
	// Update the note text and also update the timestamp in the note
	public updateText(text: string) {
		this.lastChanged = new Date().getTime();
		this.text = text;
	}

	public toggleVote(user: string) {
		const index = this.votes.indexOf(user);
		if (index > -1) {
			this.votes.removeAt(index);
		} else {
			this.votes.insertAtEnd(user);
		}

		this.lastChanged = new Date().getTime();
	}

	/**
	 * Removes a node from its parent {@link Items}.
	 * If the note is not in an {@link Items}, it is left unchanged.
	 */
	public delete() {
		const parent = Tree.parent(this);
		// Use type narrowing to ensure that parent is Items as expected for a note.
		if (Tree.is(parent, Items)) {
			const index = parent.indexOf(this);
			parent.removeAt(index);
		}
	}
}

// Schema for a list of Notes and Groups.
export class Items extends sf.arrayRecursive("Items", [() => Group, Note]) {
	public addNode(author: string) {
		const timeStamp = new Date().getTime();

		// Define the note to add to the SharedTree - this must conform to
		// the schema definition of a note
		const newNote = new Note({
			id: Guid.create().toString(),
			text: "",
			author,
			votes: [],
			created: timeStamp,
			lastChanged: timeStamp,
		});

		// Insert the note into the SharedTree.
		this.insertAtEnd(newNote);
	}

	/**
	 * Add a new group (container for notes) to the SharedTree.
	 */
	public addGroup(name: string): Group {
		const group = new Group({
			id: Guid.create().toString(),
			name,
			items: new Items([]),
		});

		this.insertAtEnd(group);
		return group;
	}
}

// Define the schema for the container of notes.
export class Group extends sf.object("Group", {
	id: sf.string,
	name: sf.string,
	items: Items,
}) {
	/**
	 * Removes a group from its parent {@link Items}.
	 * If the note is not in an {@link Items}, it is left unchanged.
	 *
	 * Before removing the group, its children are move to the parent.
	 */
	public delete() {
		const parent = Tree.parent(this);
		if (Tree.is(parent, Items)) {
			// Test for the presence of notes and move them to the root
			// in the same position as the group
			// TODO: This check for `length !== 0` should be able to be removed once a bug in SharedTree is fixed.
			if (this.items.length !== 0) {
				const index = parent.indexOf(this);
				parent.moveRangeToIndex(index, 0, this.items.length, this.items);
			}

			// Delete the now empty group
			const i = parent.indexOf(this);
			parent.removeAt(i);
		}
	}
}

// Export the tree config appropriate for this schema.
// This is passed into the SharedTree when it is initialized.
export const appTreeConfiguration = new TreeConfiguration(
	// Schema for the root
	Items,
	// initial tree
	() => new Items([]),
);
