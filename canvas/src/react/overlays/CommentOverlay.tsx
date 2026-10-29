// ============================================================================
// CommentOverlay.tsx
//
// Renders a non-interactive SVG overlay icon (comment bubble) above items that
// have one or more comments when the global comment pane is visible and the
// item itself is not currently selected. The overlay:
//   * Tracks live drag / rotation presence to stay perfectly in sync while an
//     item is being moved (avoids 1-frame lag before layout cache updates).
//   * Counter-scales by 1/zoom so the icon remains constant pixel size when
//     the canvas is zoomed in or out.
//   * Positions itself vertically using the same geometry constants as the
//     selection overlay (selectionPadding + rotationGap) so the UI feels
//     spatially consistent whether or not the selection handles are shown.
//
// Coordinate system notes:
//   * Root <g> is translated to the item origin and rotated around the center
//     (matching SelectionOverlay). Inside that, we translate to the center-top
//     offset (above the item) and then apply scale(1/zoom) so the icon draws at
//     fixed screen size (iconSizePx).
//   * The icon component (<Comment20Filled/>) is intrinsically 20x20; we center
//     it by translating (-10,-10) after scaling.
//
// No mutation of model state occurs here; purely presentational.
// ============================================================================
import React from "react";
import { Item, FluidTable } from "../../schema/appSchema.js";
import { Tree } from "fluid-framework";
import { getActiveDragForItem } from "../utils/dragUtils.js";
import { Comment20Filled } from "@fluentui/react-icons";
import type { PresenceContext } from "../contexts/PresenceContext.js";

export function CommentOverlay(props: {
	item: Item;
	layout: Map<string, { left: number; top: number; right: number; bottom: number }>;
	zoom: number;
	commentPaneVisible: boolean;
	selected: boolean;
	presence: React.ContextType<typeof PresenceContext>;
}): JSX.Element | null {
	const { item, layout, zoom, commentPaneVisible, selected, presence } = props;
	// Short‑circuit early: hide if
	//   * Global comment pane is closed (user not in comment reviewing mode)
	//   * Item is selected (selection UI already communicates focus/ affordances)
	//   * Item has zero comments
	// Doing this early avoids any geometry work.
	if (!commentPaneVisible || selected || item.comments.length === 0) return null;
	const b = layout.get(item.id);
	if (!b) return null;
	let left = b.left;
	let top = b.top;
	const w = Math.max(0, b.right - b.left);
	const h = Math.max(0, b.bottom - b.top);

	// Prefer live drag data while an item is being moved to avoid a frame of lag.
	const active = getActiveDragForItem(presence, item.id);
	if (active) {
		left = active.x;
		top = active.y;
	}

	// Angle: follow item rotation except tables which stay unrotated
	let angle = active ? active.rotation : item.rotation;
	if (Tree.is(item.content, FluidTable)) angle = 0;

	// Geometry relative to (unrotated) item bounding box:
	//   selectionPadding : matches SelectionOverlay so spacing aligns visually.
	//   rotationGapPx     : vertical gap used by rotation handle; we anchor the
	//                        comment bubble at that same virtual line so layout
	//                        feels cohesive.
	//   iconSizePx        : intrinsic size of the Fluent UI icon, used for centering.
	const selectionPadding = 8; // px (screen)
	const rotationGapPx = 22; // px (screen)
	const iconSizePx = 20; // px (screen)

	// Convert vertical offset to local coordinates: (padding + gap/zoom)
	// rotationGapPx is divided by zoom because scaling the <g> by 1/zoom later
	// would otherwise double-compensate.
	const centerYOffset = -(selectionPadding + rotationGapPx / zoom);

	// Render icon and counter-scale to remain constant size
	return (
		<g
			data-svg-item-id={item.id}
			transform={`translate(${left}, ${top}) rotate(${angle}, ${w / 2}, ${h / 2})`}
			pointerEvents="none"
		>
			<g
				// Order of transforms (rightmost applied first):
				//   1. translate(-iconSize/2, -iconSize/2): center the icon at (0,0)
				//   2. scale(1/zoom): make visual size constant across zoom levels
				//   3. translate(w/2, centerYOffset): move above item center
				transform={`translate(${w / 2}, ${centerYOffset}) scale(${1 / zoom}) translate(${-iconSizePx / 2}, ${-iconSizePx / 2})`}
				opacity={0.95}
			>
				<Comment20Filled />
			</g>
		</g>
	);
}
