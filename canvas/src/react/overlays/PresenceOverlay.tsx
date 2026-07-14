// ============================================================================
// PresenceOverlay.tsx
//
// Renders collaborator presence badges anchored to the top-left selection corner
// (same geometry as SelectionOverlay) for any remote users currently selecting
// the item. Supports two modes:
//   * Single user: renders that user's colored badge with initials.
//   * Multiple users: collapsed summary badge (count). Clicking expands into a
//     vertical stack of individual badges plus a close (×) badge.
//
// Geometry & scaling:
//   * All measurements are specified in screen pixels then divided by zoom to
//     achieve screen-constant sizing within the rotated/translated item space.
//   * Anchor uses the selection padding + outward gap so badges sit just
//     outside the selection rectangle, consistent with resize handles.
//   * Rotates with shapes (but not tables) for consistent spatial relation.
//
// Performance notes:
//   * No React state here; expansion state is lifted to parent and passed via
//     props so this component remains a pure function (easier to memo if needed).
//   * Active drag presence (in-flight movement) is mirrored to avoid a flicker
//     caused by layout cache lag.
//
// Accessibility / interactions:
//   * Badges stop propagation on mousedown so dragging the canvas underneath
//     isn't triggered.
//   * Expansion click uses pointer events only (SVG <text>/<circle> grouping).
//
// ============================================================================
import React from "react";
import { FluidTable, Item } from "../../schema/appSchema.js";
import { Tree } from "fluid-framework";
import { getActiveDragForItem } from "../utils/dragUtils.js";

export function PresenceOverlay(props: {
	item: Item;
	layout: Map<string, { left: number; top: number; right: number; bottom: number }>;
	presence: React.ContextType<typeof import("../contexts/PresenceContext.js").PresenceContext>;
	remoteIds: string[];
	zoom: number;
	getInitials: (name: string) => string;
	getUserColor: (id: string) => string;
	expanded: boolean;
	onToggleExpanded: (e: React.MouseEvent) => void;
}): JSX.Element | null {
	const {
		item,
		layout,
		presence,
		remoteIds,
		getInitials,
		getUserColor,
		expanded,
		onToggleExpanded,
		zoom,
	} = props;
	const b = layout.get(item.id);
	if (!b) return null;
	let left = b.left;
	let top = b.top;
	const w = Math.max(0, b.right - b.left);
	const h = Math.max(0, b.bottom - b.top);
	const active = getActiveDragForItem(presence, item.id);
	// While the item is being actively dragged we substitute presence coordinates
	// so the badge cluster moves perfectly in sync with the item.
	if (active) {
		left = active.x;
		top = active.y;
	}
	let angle = active ? active.rotation : item.rotation;
	if (Tree.is(item.content, FluidTable)) angle = 0;
	const connected = (presence.users.getConnectedUsers?.() ?? []) as unknown as ReadonlyArray<{
		value: { name: string; id: string; image?: string };
		client: { attendeeId: string };
	}>;
	const users = connected.filter((u) => remoteIds.includes(u.client.attendeeId));
	if (!users.length) return null;

	// Screen-space sizing constants
	const badgeRadius = 12; // px
	const badgeStroke = 2; // px
	const badgeFont = 10; // px
	const closeFont = 12; // px
	const stackSpacing = 26; // px between badges when expanded
	const closeExtraGap = 8; // px gap before close button

	// Selection overlay geometry (must mirror SelectionOverlay constants)
	const selectionPadding = 8; // px screen (same as SelectionOverlay padding)
	const outwardGapPx = 2; // px screen outward offset for resize handles
	// The top-left resize handle center (local coords) is positioned at
	// (-outwardLocal, -outwardLocal). outwardLocal is derived so that after the
	// shape is scaled by zoom the screen distance matches outwardGapPx.
	const outwardLocal = selectionPadding + outwardGapPx / zoom;

	// Additional positioning offsets (screen px) relative to the handle center.
	// These provide a visual offset so the badge doesn't overlap the corner
	// handle region and reads clearly. Tuned via design feedback.
	const shiftRightPx = -12; // negative shifts left relative to corner
	const shiftDownPx = 18; // place slightly below corner

	// Convert to local units (pre-scale)
	const r = badgeRadius / zoom;
	const strokeW = badgeStroke / zoom;
	const fontSize = badgeFont / zoom;
	const fontSizeClose = closeFont / zoom;
	const spacing = stackSpacing / zoom;
	const closeOffset = closeExtraGap / zoom;

	// Final local anchor position where the first badge (or count) is drawn.
	// Adjust by the outwardLocal (base corner) plus converted screen shifts.
	const anchorX = -outwardLocal + shiftRightPx / zoom;
	const anchorY = -outwardLocal + shiftDownPx / zoom;

	return (
		<g
			transform={`translate(${left}, ${top}) rotate(${angle}, ${w / 2}, ${h / 2})`}
			data-svg-item-id={item.id}
		>
			{users.length === 1 ? (
				<g
					transform={`translate(${anchorX}, ${anchorY})`}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<circle
						r={r}
						fill={getUserColor(users[0].client.attendeeId)}
						stroke="#fff"
						strokeWidth={strokeW}
					/>
					<text
						x={0}
						y={4 / zoom}
						textAnchor="middle"
						fontSize={fontSize}
						fontWeight={600}
						fill="#fff"
					>
						{getInitials(users[0].value.name)}
					</text>
				</g>
			) : (
				<g onMouseDown={(e) => e.stopPropagation()}>
					{!expanded ? (
						<g
							transform={`translate(${anchorX}, ${anchorY})`}
							cursor="pointer"
							onClick={onToggleExpanded}
						>
							<circle r={r} fill="#000" stroke="#fff" strokeWidth={strokeW} />
							<text
								x={0}
								y={4 / zoom}
								textAnchor="middle"
								fontSize={fontSize}
								fontWeight={600}
								fill="#fff"
							>
								{users.length}
							</text>
						</g>
					) : (
						<g>
							{users.map((user, idx) => (
								<g
									key={user.client.attendeeId}
									transform={`translate(${anchorX}, ${anchorY + idx * spacing})`}
								>
									<circle
										r={r}
										fill={getUserColor(user.client.attendeeId)}
										stroke="#fff"
										strokeWidth={strokeW}
									/>
									<text
										x={0}
										y={4 / zoom}
										textAnchor="middle"
										fontSize={fontSize}
										fontWeight={600}
										fill="#fff"
									>
										{getInitials(user.value.name)}
									</text>
								</g>
							))}
							<g
								transform={`translate(${anchorX}, ${anchorY + users.length * spacing + closeOffset})`}
								cursor="pointer"
								onClick={onToggleExpanded}
							>
								<circle r={r} fill="#4b5563" stroke="#fff" strokeWidth={strokeW} />
								<text
									x={0}
									y={4 / zoom}
									textAnchor="middle"
									fontSize={fontSizeClose}
									fontWeight={700}
									fill="#fff"
								>
									×
								</text>
							</g>
						</g>
					)}
				</g>
			)}
		</g>
	);
}
