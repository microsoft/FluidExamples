// ============================================================================
// contentHandlers.ts
//
// Centralized content type system to eliminate repetitive Tree.is() checks
// throughout the codebase. Provides a single source of truth for content
// type operations and polymorphic behavior based on content type.
//
// This replaces scattered type checking patterns with a unified interface
// that can be extended as needed for new content types or operations.
// ============================================================================

import { Tree } from "fluid-framework";
import { Item, Shape, Note, FluidTable } from "../schema/appSchema.js";

/**
 * Content type enumeration for type-safe handling
 */
export type ContentType = "shape" | "note" | "table" | "unknown";

/**
 * Common interface for all content handlers
 * Provides polymorphic behavior based on content type
 */
export interface ContentHandler {
	/** The content type this handler manages */
	readonly type: ContentType;

	/** Get the size (width/height) for layout calculations */
	getSize(): number;

	/** Get a human-readable name for this content */
	getName(): string;

	/** Whether this content type supports resizing */
	canResize(): boolean;

	/** Whether this content type supports rotation */
	canRotate(): boolean;

	/** Get the CSS transform for rotation (table content doesn't rotate) */
	getRotationTransform(rotation: number): string;
}

/**
 * Handler for Shape content
 */
class ShapeHandler implements ContentHandler {
	readonly type: ContentType = "shape";

	constructor(
		private shape: Shape,
		private sizeOverride?: number
	) {}

	getSize(): number {
		return this.sizeOverride ?? this.shape.size;
	}

	getName(): string {
		return this.shape.type;
	}

	canResize(): boolean {
		return true;
	}

	canRotate(): boolean {
		return true;
	}

	getRotationTransform(rotation: number): string {
		return `rotate(${rotation}deg)`;
	}
}

/**
 * Handler for Note content
 */
class NoteHandler implements ContentHandler {
	readonly type: ContentType = "note";

	constructor(private note: Note) {}

	getSize(): number {
		return 0; // Notes use intrinsic sizing
	}

	getName(): string {
		return "Note";
	}

	canResize(): boolean {
		return false;
	}

	canRotate(): boolean {
		return true;
	}

	getRotationTransform(rotation: number): string {
		return `rotate(${rotation}deg)`;
	}
}

/**
 * Handler for FluidTable content
 */
class TableHandler implements ContentHandler {
	readonly type: ContentType = "table";

	constructor(private table: FluidTable) {}

	getSize(): number {
		return 0; // Tables use intrinsic sizing
	}

	getName(): string {
		return "Table";
	}

	canResize(): boolean {
		return false;
	}

	canRotate(): boolean {
		return false; // Tables don't rotate
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getRotationTransform(_rotation: number): string {
		return "rotate(0)"; // Tables always stay upright
	}
}

/**
 * Handler for unknown content types
 */
class UnknownHandler implements ContentHandler {
	readonly type: ContentType = "unknown";

	getSize(): number {
		return 0;
	}

	getName(): string {
		return "Item";
	}

	canResize(): boolean {
		return false;
	}

	canRotate(): boolean {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getRotationTransform(_rotation: number): string {
		return "rotate(0)";
	}
}

/**
 * Factory function to create the appropriate content handler
 * This is the single place where Tree.is() type checking occurs
 */
export function getContentHandler(item: Item, sizeOverride?: number): ContentHandler {
	if (Tree.is(item.content, Shape)) {
		return new ShapeHandler(item.content, sizeOverride);
	}
	if (Tree.is(item.content, Note)) {
		return new NoteHandler(item.content);
	}
	if (Tree.is(item.content, FluidTable)) {
		return new TableHandler(item.content);
	}
	return new UnknownHandler();
}

/**
 * Convenience function to get just the content type
 */
export function getContentType(item: Item): ContentType {
	return getContentHandler(item).type;
}

/**
 * Type guard functions for when you need the actual content objects
 * These replace direct Tree.is() usage in most cases
 */
export function isShape(item: Item): item is Item & { content: Shape } {
	return Tree.is(item.content, Shape);
}

export function isNote(item: Item): item is Item & { content: Note } {
	return Tree.is(item.content, Note);
}

export function isTable(item: Item): item is Item & { content: FluidTable } {
	return Tree.is(item.content, FluidTable);
}
