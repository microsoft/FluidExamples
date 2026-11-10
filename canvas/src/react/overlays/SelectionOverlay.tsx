// ============================================================================
// SelectionOverlay.tsx
//
// Draws the SVG selection rectangle + rotation handle + (proxied) resize
// handles for the currently selected item inside the canvas overlay layer.
//
// Design goals:
//   * Keep all interactive geometry (handles, rotation knob) in a single SVG
//     coordinate space so we can counter-scale by zoom and maintain consistent
//     on-screen touch targets.
//   * Mirror live presence (drag / resize) to avoid perceptual lag between
//     pointer movement and overlay position / size.
//   * For shapes, show 4 corner resize handles. For tables we suppress rotation
//     & resize (tables are axis-aligned, not rotatable in current UX).
//
// Geometry overview:
//   * padding: additional space around the raw item bounds used for the
//     dashed selection rectangle.
//   * rotationGapPx: desired screen distance from top edge of selection rect
//     to the center of the rotation handle (screen pixels). Converted to local
//     units via division by zoom (then the whole overlay is rotated / translated).
//   * outwardGapPx: outward screen distance beyond the padded rectangle to
//     place corner resize handles. Converted similarly to local units.
//   * strokeDasharray: scaled by zoom so dash appearance remains constant.
//
// Event plumbing:
//   * Rotation & resize actions are delegated to the underlying HTML elements
//     (in ItemView.tsx) by synthesizing a pointerdown on the existing handles.
//     This avoids duplicating business logic; overlay is a visual proxy only.
//
// ============================================================================
import React from "react";
import { FluidTable, Item, Shape } from "../../schema/appSchema.js";
import { Tree } from "fluid-framework";
import { getActiveDragForItem } from "../utils/dragUtils.js";

export function SelectionOverlay(props: {
	item: Item;
	layout: Map<string, { left: number; top: number; right: number; bottom: number }>;
	presence: React.ContextType<typeof import("../contexts/PresenceContext.js").PresenceContext>;
	zoom: number;
}): JSX.Element | null {
	const { item, layout, presence, zoom } = props;
	const b = layout.get(item.id);
	// Base position from layout (falls back to model position if missing)
	let left = b?.left ?? item.x;
	let top = b?.top ?? item.y;
	let w = b ? Math.max(0, b.right - b.left) : 0;
	let h = b ? Math.max(0, b.bottom - b.top) : 0;

	// Prefer live resize presence for THIS item (if shape) so the overlay matches
	// the ephemeral size mid-drag. Layout cache may update a frame later.
	const resizePresence = presence.resize.state?.local;
	if (resizePresence && resizePresence.id === item.id && Tree.is(item.content, Shape)) {
		w = resizePresence.size;
		h = resizePresence.size;
		left = resizePresence.x;
		top = resizePresence.y;
	}
	if (w === 0 || h === 0) {
		const container = document.querySelector(
			`[data-item-id='${item.id}']`
		) as HTMLElement | null;
		if (container) {
			const rect = container.getBoundingClientRect();
			w = rect.width / (zoom || 1);
			h = rect.height / (zoom || 1);
		}
		if (w === 0 || h === 0) return null;
	}

	// Check if we're on iOS for larger touch targets
	const isIOS =
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

	const padding = 10 / zoom;
	const active = getActiveDragForItem(presence, item.id);
	// If dragging (but not resizing) override position/rotation for smoothness.
	if (active && !(resizePresence && resizePresence.id === item.id)) {
		left = active.x;
		top = active.y;
	}
	let angle = active ? active.rotation : item.rotation;
	const isTable = Tree.is(item.content, FluidTable);
	const isShape = Tree.is(item.content, Shape);
	if (isTable) angle = 0;

	// Screen-constant geometry (expressed in screen px, converted to local):
	const rotationGapPx = 22; // vertical offset for rotation handle center
	const outwardGapPx = 2; // outward offset for resize handles beyond padding
	// Convert to local coordinates (before rotation) by dividing by zoom.
	const rotationOffsetLocal = padding + rotationGapPx / zoom; // center y of rotation handle
	const outwardLocal = padding + outwardGapPx / zoom; // distance from item edges to handle centers
	return (
		<g
			data-svg-item-id={item.id}
			transform={`translate(${left}, ${top}) rotate(${angle}, ${w / 2}, ${h / 2})`}
		>
			<g pointerEvents="none">
				<rect
					x={-padding}
					y={-padding}
					width={w + padding * 2}
					height={h + padding * 2}
					fill="none"
					stroke="#000"
					strokeLinecap="round"
					strokeDasharray={`${(2 / zoom).toFixed(3)} ${(4 / zoom).toFixed(3)}`}
					strokeWidth={2 / zoom}
					opacity={0.9}
				/>
			</g>
			{!isTable && (
				<g transform={`translate(${w / 2}, ${-rotationOffsetLocal})`}>
					{/* Visible rotation handle */}
					<circle
						r={6 / zoom}
						fill="#000"
						cursor="grab"
						onClick={(e) => {
							e.stopPropagation();
						}}
						onPointerDown={(e) => {
							e.stopPropagation();
							const container = document.querySelector(
								`[data-item-id='${item.id}']`
							) as HTMLElement | null;
							const rotateHandle = container?.querySelector(
								".cursor-grab"
							) as HTMLElement | null;
							const target = rotateHandle ?? container;
							if (target) {
								const evt = new PointerEvent("pointerdown", {
									bubbles: true,
									cancelable: true,
									clientX: e.clientX,
									clientY: e.clientY,
									pointerType: e.pointerType,
									pointerId: e.pointerId,
									button: 0,
									buttons: 1,
									isPrimary: e.isPrimary,
								});
								target.dispatchEvent(evt);
							}
						}}
					/>
					{/* Larger invisible touch target for iOS */}
					{isIOS && (
						<circle
							r={Math.max(22 / zoom, 6 / zoom)}
							fill="transparent"
							cursor="grab"
							onClick={(e) => {
								e.stopPropagation();
							}}
							onPointerDown={(e) => {
								e.stopPropagation();
								const container = document.querySelector(
									`[data-item-id='${item.id}']`
								) as HTMLElement | null;
								const rotateHandle = container?.querySelector(
									".cursor-grab"
								) as HTMLElement | null;
								const target = rotateHandle ?? container;
								if (target) {
									const evt = new PointerEvent("pointerdown", {
										bubbles: true,
										cancelable: true,
										clientX: e.clientX,
										clientY: e.clientY,
										pointerType: e.pointerType,
										pointerId: e.pointerId,
										button: 0,
										buttons: 1,
										isPrimary: e.isPrimary,
									});
									target.dispatchEvent(evt);
								}
							}}
						/>
					)}
				</g>
			)}
			{isShape && (
				<g>
					{(() => {
						const handleSize = 8 / zoom;
						const half = handleSize / 2;
						// For iOS, create larger invisible touch targets
						const touchTargetSize = isIOS
							? Math.max(44 / zoom, handleSize)
							: handleSize;
						const touchHalf = touchTargetSize / 2;
						const positions = [
							// Top-left
							{ x: -outwardLocal, y: -outwardLocal, cursor: "nwse-resize" as const },
							// Top-right
							{
								x: w + outwardLocal,
								y: -outwardLocal,
								cursor: "nesw-resize" as const,
							},
							// Bottom-left
							{
								x: -outwardLocal,
								y: h + outwardLocal,
								cursor: "nesw-resize" as const,
							},
							// Bottom-right
							{
								x: w + outwardLocal,
								y: h + outwardLocal,
								cursor: "nwse-resize" as const,
							},
						];
						return positions.map((pos, i) => (
							<g key={i}>
								{/* Visible handle */}
								<rect
									x={pos.x - half}
									y={pos.y - half}
									width={handleSize}
									height={handleSize}
									fill="#000"
									stroke="none"
									cursor={pos.cursor}
									onClick={(e) => {
										e.stopPropagation();
									}}
									onPointerDown={(e) => {
										e.stopPropagation();
										const container = document.querySelector(
											`[data-item-id='${item.id}']`
										) as HTMLElement | null;
										const handles = Array.from(
											container?.querySelectorAll(".cursor-nw-resize") ?? []
										) as HTMLElement[];
										const handle = handles[i] ?? container;
										if (handle) {
											const evt = new PointerEvent("pointerdown", {
												bubbles: true,
												cancelable: true,
												clientX: e.clientX,
												clientY: e.clientY,
												pointerType: e.pointerType,
												pointerId: e.pointerId,
												button: 0,
												buttons: 1,
												isPrimary: e.isPrimary,
											});
											handle.dispatchEvent(evt);
										}
									}}
								/>
								{/* Larger invisible touch target for iOS */}
								{isIOS && touchTargetSize > handleSize && (
									<rect
										x={pos.x - touchHalf}
										y={pos.y - touchHalf}
										width={touchTargetSize}
										height={touchTargetSize}
										fill="transparent"
										stroke="none"
										cursor={pos.cursor}
										onClick={(e) => {
											e.stopPropagation();
										}}
										onPointerDown={(e) => {
											e.stopPropagation();
											const container = document.querySelector(
												`[data-item-id='${item.id}']`
											) as HTMLElement | null;
											const handles = Array.from(
												container?.querySelectorAll(".cursor-nw-resize") ??
													[]
											) as HTMLElement[];
											const handle = handles[i] ?? container;
											if (handle) {
												const evt = new PointerEvent("pointerdown", {
													bubbles: true,
													cancelable: true,
													clientX: e.clientX,
													clientY: e.clientY,
													pointerType: e.pointerType,
													pointerId: e.pointerId,
													button: 0,
													buttons: 1,
													isPrimary: e.isPrimary,
												});
												handle.dispatchEvent(evt);
											}
										}}
									/>
								)}
							</g>
						));
					})()}
				</g>
			)}
		</g>
	);
}
