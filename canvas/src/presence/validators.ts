/**
 * Presence Data Validators
 *
 * This module provides runtime validation for all Fluid Framework presence data types
 * using Zod schemas. The Fluid Framework presence API supports runtime validation to
 * prevent type errors and ensure data integrity across connected clients.
 *
 * These validators are used with StateFactory.latest() to create validated presence states
 * that automatically check incoming data against the defined schemas.
 */

import { z } from "zod";

/**
 * UserInfo Schema
 * Validates user profile information including ID, name, and optional avatar image.
 */
export const UserInfoSchema = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().optional(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

/**
 * UserInfo Validator Function
 * Converts unknown data to UserInfo or returns undefined if validation fails.
 */
export function validateUserInfo(value: unknown): UserInfo | undefined {
	const result = UserInfoSchema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * Selection Schema
 * Validates basic selection objects with a unique ID.
 */
export const SelectionSchema = z.object({
	id: z.string(),
});

export type Selection = z.infer<typeof SelectionSchema>;

/**
 * Selection Validator Function
 */
export function validateSelection(value: unknown): Selection | undefined {
	const result = SelectionSchema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * TypedSelection Schema
 * Extends Selection with optional type information for table selections.
 */
export const TypedSelectionSchema = z.object({
	id: z.string(),
	type: z.enum(["row", "column", "cell"]).optional(),
});

export type TypedSelection = z.infer<typeof TypedSelectionSchema>;

/**
 * Enumeration of supported selection types.
 * Used for providing context about what kind of element is selected.
 */
export type selectionType = "row" | "column" | "cell";

/**
 * TypedSelection Validator Function
 */
export function validateTypedSelection(value: unknown): TypedSelection | undefined {
	const result = TypedSelectionSchema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * Selection Array Validator Function
 */
export function validateSelectionArray(value: unknown): Selection[] | undefined {
	const schema = z.array(SelectionSchema);
	const result = schema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * TypedSelection Array Validator Function
 */
export function validateTypedSelectionArray(value: unknown): TypedSelection[] | undefined {
	const schema = z.array(TypedSelectionSchema);
	const result = schema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * DragAndRotatePackage Schema
 * Validates drag operation data including position, rotation, and branch info.
 */
export const DragAndRotatePackageSchema = z.object({
	id: z.string(),
	x: z.number(),
	y: z.number(),
	rotation: z.number(),
	branch: z.boolean(),
});

export type DragAndRotatePackage = z.infer<typeof DragAndRotatePackageSchema>;

/**
 * DragAndRotatePackage Validator Function
 */
export function validateDragAndRotatePackage(
	value: unknown
): DragAndRotatePackage | null | undefined {
	if (value === null) return null;
	const result = DragAndRotatePackageSchema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * ResizePackage Schema
 * Validates resize operation data including position and size.
 */
export const ResizePackageSchema = z.object({
	id: z.string(),
	x: z.number(),
	y: z.number(),
	size: z.number(),
});

export type ResizePackage = z.infer<typeof ResizePackageSchema>;

/**
 * ResizePackage Validator Function
 */
export function validateResizePackage(value: unknown): ResizePackage | null | undefined {
	if (value === null) return null;
	const result = ResizePackageSchema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * EphemeralPoint Schema
 * Validates a single point in an ephemeral ink stroke.
 */
export const EphemeralPointSchema = z.object({
	x: z.number(),
	y: z.number(),
	t: z.number().optional(),
	p: z.number().optional(),
});

export type EphemeralPoint = z.infer<typeof EphemeralPointSchema>;

/**
 * EphemeralInkStroke Schema
 * Validates ephemeral ink stroke data for real-time drawing.
 */
export const EphemeralInkStrokeSchema = z.object({
	id: z.string(),
	points: z.array(EphemeralPointSchema),
	color: z.string(),
	width: z.number(),
	opacity: z.number(),
	startTime: z.number(),
});

export type EphemeralInkStroke = z.infer<typeof EphemeralInkStrokeSchema>;

/**
 * EphemeralInkStroke Validator Function
 */
export function validateEphemeralInkStroke(value: unknown): EphemeralInkStroke | null | undefined {
	if (value === null) return null;
	const result = EphemeralInkStrokeSchema.safeParse(value);
	return result.success ? result.data : undefined;
}

/**
 * CursorState Schema
 * Validates cursor position and visibility state.
 */
export const CursorStateSchema = z.object({
	x: z.number(),
	y: z.number(),
	visible: z.boolean(),
	timestamp: z.number(),
});

export type CursorState = z.infer<typeof CursorStateSchema>;

/**
 * CursorState Validator Function
 */
export function validateCursorState(value: unknown): CursorState | null | undefined {
	if (value === null) return null;
	const result = CursorStateSchema.safeParse(value);
	return result.success ? result.data : undefined;
}
