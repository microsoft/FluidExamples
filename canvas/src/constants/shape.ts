// Single source of truth for shape sizing
// Original max was 120; previously expanded to 480; now increased to 1200 for larger canvases.
// Adjust here if product requirements change.
export const SHAPE_MIN_SIZE = 20;
export const SHAPE_MAX_SIZE = 1200; // Global max (restored); spawn range remains narrower

// Initial spawn sizes should be modest so new shapes aren't huge by default.
// These don't affect the max the user can resize to.
export const SHAPE_SPAWN_MIN_SIZE = 120;
export const SHAPE_SPAWN_MAX_SIZE = 180; // Match new max so spawn can reach full size

export function clampShapeSize(size: number): number {
	return Math.max(SHAPE_MIN_SIZE, Math.min(SHAPE_MAX_SIZE, size));
}
