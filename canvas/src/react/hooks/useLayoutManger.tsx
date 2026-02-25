/**
 * Layout Manager Hook
 *
 * Provides layout management functionality for the Fluid Framework demo application.
 * This module manages the positioning and bounds of UI elements, maintaining a cache
 * of element positions for efficient layout calculations and collision detection.
 *
 * Key Features:
 * - Global layout cache for element positions and bounds
 * - Context-based sharing of layout information across components
 * - Efficient position tracking for collaborative elements
 * - Bounds calculation for drag/drop operations
 * - Layout optimization for responsive design
 *
 * The layout cache stores bounding box information (left, top, right, bottom)
 * for UI elements identified by string keys, enabling components to query
 * and update layout information as needed.
 */

import { createContext } from "react";

/**
 * Type definition for element layout bounds.
 * Represents the bounding box of a UI element in screen coordinates.
 */
interface ElementBounds {
	/** Left edge position in pixels */
	left: number;
	/** Top edge position in pixels */
	top: number;
	/** Right edge position in pixels */
	right: number;
	/** Bottom edge position in pixels */
	bottom: number;
}

/**
 * Global layout cache for storing element positions and bounds.
 * Maps element IDs to their current bounding box information.
 *
 * This cache is used for:
 * - Collision detection during drag operations
 * - Layout calculations for responsive design
 * - Position tracking for collaborative elements
 * - Performance optimization by avoiding repeated DOM queries
 */
export const layoutCache = new Map<string, ElementBounds>();

/**
 * React context for sharing layout cache across the component tree.
 * Provides access to the global layout cache from any component that needs
 * to query or update element position information.
 *
 * Components can use this context to:
 * - Register their position in the layout cache
 * - Query positions of other elements
 * - Perform layout calculations
 * - Optimize rendering based on element visibility
 */
export const LayoutContext = createContext(layoutCache);
