import { TreeConfiguration, SchemaFactory } from "fluid-framework";
import { addNote } from "../utils/app_helpers";
import { Guid } from "guid-typescript";

// Schema is defined using a factory object that generates classes for objects as well
// as list and map nodes.

// Include a UUID to guarantee that this schema will be uniquely identifiable
const sf = new SchemaFactory("fc1db2e8-0a00-11ee-be56-0242ac120002");

// Define the schema for the note object. This schema includes an id to make
// building the React app simpler, several fields that use primitive types, and a sequence
// of user ids to track which users have voted on this note.
// Some of the helper functions for working with the data contained in this object
// are included in this class definition.
export class Note extends sf.object("Note", {
	id: sf.string,
	text: sf.string,
	author: sf.string,
	votes: sf.array(sf.string),
	created: sf.number,
	lastChanged: sf.number,
}) {
	// Update the note text and also update the timestamp in the note
	public updateText(text: string) {
		this.lastChanged = new Date().getTime();
		this.text = text;
	}

	public toggleVote(user: string) {
		const index = this.votes.indexOf(user);
		if (index > -1) {
			this.votes.removeAt(index);
			this.lastChanged = new Date().getTime();
		} else {
			this.votes.insertAtEnd(user);
			this.lastChanged = new Date().getTime();
		}
	}
}

// Schema for a list of Notes.
export class Notes extends sf.array("Notes", Note) {
	public newNote(author: string) {
		addNote(this, "", author);
	}
}

// Define the schema for the container of notes.
export class Group extends sf.object("Group", {
	id: sf.string,
	name: sf.string,
	notes: Notes,
}) {}

// Schema for a list of Notes and Groups.
export class Items extends sf.array("Items", [Group, Note]) {
	public newNote(author: string) {
		addNote(this, "", author);
	}

	// Add a new group (container for notes) to the SharedTree.
	public newGroup(name: string): Group {
		const group = new Group({
			id: Guid.create().toString(),
			name,
			notes: [],
		});

		this.insertAtEnd(group);
		return group;
	}
}

// Define a root type.
export class App extends sf.object("App", {
	items: Items,
}) {}

// Export the tree config appropriate for this schema
// This is passed into the SharedTree when it is initialized
export const appTreeConfiguration = new TreeConfiguration(
	App, // root node
	() => ({
		// initial tree
		items: [],
	}),
);
