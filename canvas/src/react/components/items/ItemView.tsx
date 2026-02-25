// ============================================================================
// ItemView.tsx
//
// Centralized view & interaction layer for all "items" rendered on the canvas.
// Items include Shapes, Notes, and Tables. This file coordinates:
//   * Rendering the correct content component (ShapeView / NoteView / TableView)
//   * Local optimistic interaction (drag / rotate / resize) using ephemeral
//     presence channels before committing final values to the Fluid tree.
//   * Selection visualization and remote collaborator indicators.
//
// Key architectural choices:
//   1. Pointer events are unified (mouse / pen / touch) via onPointerDown and
//      document-level listeners for move + up to avoid losing events when the
//      pointer leaves the element or during fast touch interactions.
//   2. Dragging uses an absolute delta model (currentCanvas - startCanvas) plus
//      the item's initial position. Earlier incremental / clamped logic was
//      intentionally removed to reduce complexity and eliminate jump / stutter
//      issues with foreignObject (SVG / HTML overlay) elements like tables.
//   3. Resizing (shapes only) maintains the geometric center of the shape and
//      scales uniformly by projecting the live pointer vector onto the initial
//      pointer vector (dot product + magnitude ratio). This avoids distortion
//      and gives intuitive "corner pull" semantics even when rotated (rotation
//      currently only affects visual transform; resize math is center-based).
//   4. Rotation computes the angle from the center of the item to the pointer,
//      adding +90° so that 0° aligns with a visually upright orientation.
//   5. A small movement threshold (increased when starting inside an interactive
//      child like <input>) differentiates click vs drag while preserving the
//      ability to focus and use embedded controls.
//   6. A global document.documentElement.dataset.manipulating flag gates pan /
//      navigation logic elsewhere so canvas panning does not interfere with
//      precision drag / rotate / resize operations, especially on touch.
//
// Math hotspots (see inline comments for detail):
//   * calculateCanvasMouseCoordinates: screen -> canvas space (pan & zoom)
//   * Drag deltas: dx, dy relative to start pointer in canvas space.
//   * Rotation: atan2 to derive degrees; normalized to [0, 360).
//   * Resize: dot product projection to get scale ratio while preserving center.
//
// No functional logic is altered by the commentary added in this pass.
// ============================================================================
import React, { useContext, useEffect, useRef, useState } from "react";
import { clampShapeSize } from "../../../constants/shape.js";
import { Tree } from "fluid-framework";
import { FluidTable, Item, Note } from "../../../schema/appSchema.js";
import { PresenceContext } from "../../contexts/PresenceContext.js";
import { useTree, objectIdNumber } from "../../hooks/useTree.js";
import { ShapeView } from "./ShapeView.js";
import { NoteView } from "./NoteView.js";
import { TableView } from "./TableView.js";
import { usePresenceManager } from "../../hooks/usePresenceManger.js";
import { PresenceManager } from "../../../presence/Interfaces/PresenceManager.js";
import { DragAndRotatePackage } from "../../../presence/drag.js";
import { ResizePackage } from "../../../presence/Interfaces/ResizeManager.js";
import { LayoutContext } from "../../hooks/useLayoutManger.js";
import { ChevronLeft16Filled } from "@fluentui/react-icons";
import { getContentHandler, getContentType, isShape } from "../../../utils/contentHandlers.js";

// ============================================================================
// Helpers
// ============================================================================
const USER_COLORS = [
	"#3b82f6",
	"#ef4444",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#06b6d4",
	"#f97316",
	"#84cc16",
	"#ec4899",
	"#6366f1",
	"#f43f5e",
	"#14b8a6",
	"#a855f7",
	"#0ea5e9",
];
const userColor = (id: string) => {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
	return USER_COLORS[Math.abs(h) % USER_COLORS.length];
};
const initials = (n: string) => {
	if (!n) return "?";
	const p = n.trim().split(/\s+/);
	return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};
const itemType = (item: Item) => getContentType(item);

export const calculateCanvasMouseCoordinates = (
	e: { clientX: number; clientY: number },
	pan?: { x: number; y: number },
	zoom = 1
) => {
	// Translate a raw (clientX, clientY) into logical canvas coordinates by:
	//   1. Subtracting the canvas element's top-left (DOMRect) to obtain a local
	//      position relative to the canvas in CSS pixels.
	//   2. Removing the current pan offset so (0,0) corresponds to the logical
	//      unpanned origin the model expects.
	//   3. Dividing by zoom to map CSS pixels back into model (logical) units.
	// This keeps the model fully resolution / zoom independent and ensures
	// consistent math for drag / resize / rotate no matter the viewport scale.
	const c = document.getElementById("canvas");
	const r = c?.getBoundingClientRect() || ({ left: 0, top: 0 } as DOMRect);
	const sx = e.clientX - r.left; // screen -> canvas local X (CSS px)
	const sy = e.clientY - r.top; // screen -> canvas local Y (CSS px)
	return { x: (sx - (pan?.x ?? 0)) / zoom, y: (sy - (pan?.y ?? 0)) / zoom };
};
export const calculateOffsetFromCanvasOrigin = (
	e: { clientX: number; clientY: number },
	item: Item,
	pan?: { x: number; y: number },
	zoom = 1
) => {
	// Computes the pointer offset relative to the item's top-left corner in
	// model coordinates. Useful for anchor-preserving drag strategies (not used
	// by the current absolute delta approach but retained for potential reuse).
	const c = calculateCanvasMouseCoordinates(e, pan, zoom);
	return { x: c.x - item.x, y: c.y - item.y };
};
export {
	calculateCanvasMouseCoordinates as canvasCoords,
	calculateOffsetFromCanvasOrigin as dragOffset,
};

// ============================================================================
// Content dispatcher
// ============================================================================
export function ContentElement({
	item,
	shapeProps,
}: {
	item: Item;
	shapeProps?: { sizeOverride?: number };
}) {
	useTree(item.content);
	const handler = getContentHandler(item, shapeProps?.sizeOverride);

	if (handler.type === "shape" && isShape(item)) {
		return (
			<ShapeView
				key={objectIdNumber(item.content)}
				shape={item.content}
				sizeOverride={shapeProps?.sizeOverride}
			/>
		);
	}
	if (handler.type === "note" && Tree.is(item.content, Note)) {
		return <NoteView key={objectIdNumber(item.content)} note={item.content} />;
	}
	if (handler.type === "table" && Tree.is(item.content, FluidTable)) {
		return <TableView key={objectIdNumber(item.content)} fluidTable={item.content} />;
	}
	return <></>;
}

// ============================================================================
// ItemView – unified pointer drag / rotate / resize via presence
// ============================================================================
export function ItemView(props: {
	item: Item;
	index: number;
	canvasPosition: { left: number; top: number };
	hideSelectionControls?: boolean;
	pan?: { x: number; y: number };
	zoom?: number;
}) {
	const { item, index, hideSelectionControls } = props;
	useTree(item);
	const presence = useContext(PresenceContext);
	const layout = useContext(LayoutContext);
	const [selected, setSelected] = useState(presence.itemSelection.testSelection({ id: item.id }));
	const [shapeProps, setShapeProps] = useState<{ sizeOverride?: number }>({});
	const dragRef = useRef<DragState | null>(null);
	// (offset ref removed in delta-based drag implementation)
	const intrinsic = useRef({ w: 0, h: 0 });
	const [view, setView] = useState({
		left: item.x,
		top: item.y,
		zIndex: index,
		transform: `rotate(${item.rotation}deg)`,
	});

	useEffect(() => {
		setView((v) => ({
			...v,
			left: item.x,
			top: item.y,
			zIndex: index,
			transform: itemType(item) === "table" ? "rotate(0)" : `rotate(${item.rotation}deg)`,
		}));
	}, [item.x, item.y, item.rotation, index]);

	// Presence listeners
	const applyDrag = (d: DragAndRotatePackage) => {
		if (!d || d.id !== item.id) return;
		// Ephemeral (presence) update: we optimistically render the new position
		// immediately for smooth remote & local collaborative movement. Commit to
		// the authoritative Fluid tree only on pointerup / drag end.
		setView((v) => ({
			...v,
			left: d.x,
			top: d.y,
			transform: getContentHandler(item).getRotationTransform(d.rotation),
		}));
		const handler = getContentHandler(item, shapeProps.sizeOverride);
		const w = intrinsic.current.w || handler.getSize();
		const h = intrinsic.current.h || handler.getSize();
		// Update the spatial index (layout) so hit-testing / selection overlays can
		// track live motion. This uses either measured intrinsic size (for table /
		// note) or shape size. Only performed if dimensions are known.
		if (w && h) layout.set(item.id, { left: d.x, top: d.y, right: d.x + w, bottom: d.y + h });
	};
	const applyResize = (r: ResizePackage | null) => {
		if (r && r.id === item.id && getContentHandler(item).canResize()) {
			// During a resize we shift the item's (x,y) so that scaling occurs around
			// the geometric center, keeping the visual center stationary while edges
			// expand / contract uniformly.
			setView((v) => ({ ...v, left: r.x, top: r.y }));
			setShapeProps({ sizeOverride: r.size });
			intrinsic.current = { w: r.size, h: r.size };
			layout.set(item.id, { left: r.x, top: r.y, right: r.x + r.size, bottom: r.y + r.size });
		} else if (!r || r.id !== item.id) setShapeProps({});
	};
	usePresenceManager(
		presence.drag as PresenceManager<DragAndRotatePackage>,
		(u) => u && applyDrag(u),
		applyDrag
	);
	usePresenceManager(
		presence.resize as PresenceManager<ResizePackage | null>,
		(u) => applyResize(u),
		applyResize
	);
	usePresenceManager(
		presence.itemSelection,
		() => {},
		(sel) => setSelected(sel.some((s) => s.id === item.id))
	);

	// Pointer lifecycle (delta-based to avoid foreignObject measurement jumps)
	const coordsCanvas = (e: { clientX: number; clientY: number }) =>
		calculateCanvasMouseCoordinates(e, props.pan, props.zoom);
	interface DragState {
		pointerId: number;
		started: boolean;
		startItemX: number;
		startItemY: number;
		startCanvasX: number;
		startCanvasY: number;
		interactiveStart: boolean;
	}

	// Shared logic for both mouse and touch
	const handleItemInteraction = (
		e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
		isTouch: boolean
	) => {
		const targetEl = e.target as HTMLElement;
		const interactive = !!targetEl.closest(
			'textarea, input, select, button, [contenteditable="true"], .dropdown, .menu'
		);

		// Check if this is interaction with UI handles (resize/rotate)
		const isUIHandle = !!targetEl.closest("[data-resize-handle], [data-rotate-handle]");
		const isDirectHandle =
			targetEl.hasAttribute("data-resize-handle") ||
			targetEl.hasAttribute("data-rotate-handle") ||
			targetEl.parentElement?.hasAttribute("data-resize-handle") ||
			targetEl.parentElement?.hasAttribute("data-rotate-handle");
		const isAnyHandle = isUIHandle || isDirectHandle;

		// For touch on handles, prevent default and stop propagation
		if (isTouch && isAnyHandle) {
			e.preventDefault();
			e.stopPropagation();
		}

		// Always stop propagation for item interactions to prevent Canvas interference
		const isDropdownMenu = targetEl.closest(".dropdown, .menu");
		if (!isDropdownMenu) {
			e.stopPropagation();
		}

		// Set selection unless interacting with UI controls
		const shouldSkipSelection = targetEl.closest("button, select, .dropdown, .menu");
		if (!shouldSkipSelection) {
			// Respect Ctrl/Meta for multi-select
			if (e.ctrlKey || e.metaKey) {
				presence.itemSelection.toggleSelection({ id: item.id });
			} else {
				presence.itemSelection.setSelection({ id: item.id });
			}
		}

		return { targetEl, interactive, isAnyHandle };
	};

	const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;

		const { interactive } = handleItemInteraction(e, false);
		const start = coordsCanvas(e);

		dragRef.current = {
			pointerId: -1, // Use -1 for mouse to distinguish from touch
			started: false,
			startItemX: item.x,
			startItemY: item.y,
			startCanvasX: start.x,
			startCanvasY: start.y,
			interactiveStart: interactive,
		};

		const THRESHOLD_BASE = 4;
		const docMove = (ev: MouseEvent) => {
			const st = dragRef.current;
			if (!st) return;
			const cur = coordsCanvas(ev);
			const dx = cur.x - st.startCanvasX;
			const dy = cur.y - st.startCanvasY;
			if (!st.started) {
				const threshold = st.interactiveStart ? THRESHOLD_BASE * 2 : THRESHOLD_BASE;
				if (Math.hypot(dx, dy) < threshold) return;
				st.started = true;
				document.documentElement.dataset.manipulating = "1";
				ev.preventDefault();
			}
			if (st.started) {
				presence.drag.setDragging({
					id: item.id,
					x: st.startItemX + dx,
					y: st.startItemY + dy,
					rotation: item.rotation,
					branch: presence.branch,
				});
			}
		};

		const finish = () => {
			const st = dragRef.current;
			if (!st) return;
			if (st.started) {
				const cur = { x: st.startItemX, y: st.startItemY };
				const dragState = presence.drag.state.local;
				if (dragState && dragState.id === item.id) {
					cur.x = dragState.x;
					cur.y = dragState.y;
				}
				Tree.runTransaction(item, () => {
					item.x = cur.x;
					item.y = cur.y;
				});
				presence.drag.clearDragging();
				delete document.documentElement.dataset.manipulating;
			} else {
				// Click - focus note if applicable
				if (itemType(item) === "note" && !st.interactiveStart) {
					const host = (e.currentTarget as HTMLElement).querySelector(
						"textarea"
					) as HTMLTextAreaElement | null;
					host?.focus();
				}
			}
			dragRef.current = null;
			document.removeEventListener("mousemove", docMove);
			document.removeEventListener("mouseup", finish);
		};

		document.addEventListener("mousemove", docMove);
		document.addEventListener("mouseup", finish);
	};

	const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		// Only handle single touch for now
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		const { interactive } = handleItemInteraction(e, true);
		const start = coordsCanvas(touch);

		dragRef.current = {
			pointerId: touch.identifier,
			started: false,
			startItemX: item.x,
			startItemY: item.y,
			startCanvasX: start.x,
			startCanvasY: start.y,
			interactiveStart: interactive,
		};

		const THRESHOLD_BASE = 4;
		const docMove = (ev: TouchEvent) => {
			const st = dragRef.current;
			if (!st) return;

			// Find our touch
			const touch = Array.from(ev.touches).find((t) => t.identifier === st.pointerId);
			if (!touch) return;

			const cur = coordsCanvas(touch);
			const dx = cur.x - st.startCanvasX;
			const dy = cur.y - st.startCanvasY;
			if (!st.started) {
				// Use same threshold for touch to keep behavior consistent
				const threshold = st.interactiveStart ? THRESHOLD_BASE * 2 : THRESHOLD_BASE;
				if (Math.hypot(dx, dy) < threshold) return;
				st.started = true;
				document.documentElement.dataset.manipulating = "1";
				ev.preventDefault();
			}
			if (st.started) {
				presence.drag.setDragging({
					id: item.id,
					x: st.startItemX + dx,
					y: st.startItemY + dy,
					rotation: item.rotation,
					branch: presence.branch,
				});
			}
		};

		const finish = () => {
			const st = dragRef.current;
			if (!st) return;
			if (st.started) {
				const cur = { x: st.startItemX, y: st.startItemY };
				const dragState = presence.drag.state.local;
				if (dragState && dragState.id === item.id) {
					cur.x = dragState.x;
					cur.y = dragState.y;
				}
				Tree.runTransaction(item, () => {
					item.x = cur.x;
					item.y = cur.y;
				});
				presence.drag.clearDragging();
				delete document.documentElement.dataset.manipulating;
			} else {
				// Touch tap - focus note if applicable
				if (itemType(item) === "note" && !st.interactiveStart) {
					const host = (e.currentTarget as HTMLElement).querySelector(
						"textarea"
					) as HTMLTextAreaElement | null;
					host?.focus();
				}
			}
			dragRef.current = null;
			document.removeEventListener("touchmove", docMove);
			document.removeEventListener("touchend", finish);
			document.removeEventListener("touchcancel", finish);
		};

		document.addEventListener("touchmove", docMove, { passive: false });
		document.addEventListener("touchend", finish);
		document.addEventListener("touchcancel", finish);
	};

	// No-op handlers required because we attach to document
	const onPointerMove = () => {};
	const onPointerUp = () => {};

	// Layout measurement
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const measure = () => {
			let w = 0,
				h = 0;
			const handler = getContentHandler(item, shapeProps.sizeOverride);
			if (handler.type === "shape") {
				const size = handler.getSize();
				w = size;
				h = size;
			} else {
				// For HTML-backed items (notes / tables) we rely on DOM measurement.
				// offsetWidth/Height are in CSS pixels; if zoomed, divide by zoom to
				// convert back to model units so layout comparisons remain consistent.
				w = el.offsetWidth;
				h = el.offsetHeight;
				if ((!w || !h) && el.getBoundingClientRect) {
					const bb = el.getBoundingClientRect();
					const z = props.zoom || 1;
					w = (w || bb.width) / z;
					h = (h || bb.height) / z;
				}
			}
			if (!w || !h) return;
			intrinsic.current = { w, h };
			// Update layout bounds so other systems (e.g. selection region tests)
			// have accurate spatial data even when presence (drag) modifies the
			// visual position before commit.
			layout.set(item.id, {
				left: view.left,
				top: view.top,
				right: view.left + w,
				bottom: view.top + h,
			});
		};
		measure();
		let ro: ResizeObserver | null = null;
		if (typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(measure);
			ro.observe(el);
		}
		return () => ro?.disconnect();
	}, [item.id, item.content, view.left, view.top, shapeProps.sizeOverride, props.zoom, layout]);

	// Never mutate view directly (React may freeze state objects in strict/dev modes)
	const style = {
		...view,
		zIndex: index,
		touchAction: "none",
		WebkitUserSelect: "none",
		userSelect: "none",
	} as const;
	return (
		<div
			ref={ref}
			data-item-id={item.id}
			onMouseDown={(e) => {
				// Suppress an immediate background clear after interacting with an item.
				const svg = document.querySelector('svg[data-canvas-root="true"]') as
					| (SVGSVGElement & { dataset: DOMStringMap })
					| null;
				if (svg) {
					// 75ms is enough to cover click bubbling & selection updates without affecting real background clicks.
					svg.dataset.suppressClearUntil = String(Date.now() + 75);
				}
				onMouseDown(e);
			}}
			onTouchStart={(e) => {
				// Suppress an immediate background clear after interacting with an item.
				const svg = document.querySelector('svg[data-canvas-root="true"]') as
					| (SVGSVGElement & { dataset: DOMStringMap })
					| null;
				if (svg) {
					// 75ms is enough to cover click bubbling & selection updates without affecting real background clicks.
					svg.dataset.suppressClearUntil = String(Date.now() + 75);
				}
				onTouchStart(e);
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			className="absolute"
			style={style}
			onClick={(e) => {
				e.stopPropagation();
				// Selection is now handled in onMouseDown/onTouchStart to avoid conflicts with drag system
			}}
		>
			<SelectionBox
				selected={!!selected}
				item={item}
				onResizeEnd={() => setShapeProps({})}
				visualHidden={!!hideSelectionControls}
			/>
			<ContentElement item={item} shapeProps={shapeProps} />
		</div>
	);
}

// ============================================================================
// Selection visuals
// ============================================================================
export function SelectionBox({
	selected,
	item,
	onResizeEnd,
	visualHidden,
}: {
	selected: boolean;
	item: Item;
	onResizeEnd?: () => void;
	visualHidden?: boolean;
}) {
	useTree(item);
	const pad = 8;
	return (
		<>
			<div style={{ display: selected ? (visualHidden ? "none" : "block") : "none" }}>
				<SelectionControls item={item} padding={pad} onResizeEnd={onResizeEnd} />
			</div>
			<div
				className={`absolute border-3 border-dashed border-black bg-transparent ${selected && !visualHidden ? "" : " hidden"}`}
				style={{
					left: -pad,
					top: -pad,
					width: `calc(100% + ${pad * 2}px)`,
					height: `calc(100% + ${pad * 2}px)`,
					zIndex: 1000,
					pointerEvents: "none",
				}}
			/>
		</>
	);
}
export function SelectionControls({
	item,
	padding,
	onResizeEnd,
}: {
	item: Item;
	padding: number;
	onResizeEnd?: () => void;
}) {
	useTree(item);
	const showRotate = itemType(item) !== "table";
	return (
		<>
			{showRotate && <RotateHandle item={item} />}
			<CornerResizeHandles item={item} padding={padding} onResizeEnd={onResizeEnd} />
		</>
	);
}

// ============================================================================
// Rotate
// ============================================================================
export function RotateHandle({ item }: { item: Item }) {
	const presence = useContext(PresenceContext);
	useTree(item);
	const [active, setActive] = useState(false);
	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		setActive(true);
		// Improve touch reliability
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			/* unsupported */
		}
		// Set initial drag presence immediately so pan guard sees it
		presence.drag.setDragging({
			id: item.id,
			x: item.x,
			y: item.y,
			rotation: item.rotation,
			branch: presence.branch,
		});
		// Global manipulating flag as additional safeguard against background pan
		document.documentElement.dataset.manipulating = "1";
		const el = document.querySelector(`[data-item-id="${item.id}"]`) as HTMLElement | null;
		if (!el) return;
		const move = (ev: PointerEvent) => {
			// Rotation math:
			//   * r = element bounds in screen space.
			//   * c = canvas bounds (origin for local normalization).
			//   * (cx, cy) = center of the element in canvas-local coordinates.
			//   * (mx, my) = current pointer in canvas-local coordinates.
			//   * Angle computed via atan2(dy, dx) returns radians from +X axis.
			//   * Convert to degrees, then +90 so 0deg visually corresponds to "up".
			//   * Normalize to [0, 360) for consistency & easier modulo reasoning.
			const r = el.getBoundingClientRect();
			const c =
				document.getElementById("canvas")?.getBoundingClientRect() ||
				({ left: 0, top: 0 } as DOMRect);
			const cx = (r.left + r.right) / 2 - c.left;
			const cy = (r.top + r.bottom) / 2 - c.top;
			const mx = ev.clientX - c.left;
			const my = ev.clientY - c.top;
			let deg = (Math.atan2(my - cy, mx - cx) * 180) / Math.PI + 90;
			deg %= 360;
			if (deg < 0) deg += 360;
			presence.drag.setDragging({
				id: item.id,
				x: item.x,
				y: item.y,
				rotation: deg,
				branch: presence.branch,
			});
		};
		const up = () => {
			setActive(false);
			document.removeEventListener("pointermove", move);
			try {
				(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
			} catch {
				/* ignore */
			}
			delete document.documentElement.dataset.manipulating;
			const st = presence.drag.state.local;
			if (st) {
				Tree.runTransaction(item, () => {
					item.rotation = st.rotation;
				});
				presence.drag.clearDragging();
				const canvasEl = document.getElementById("canvas") as
					| (SVGSVGElement & { dataset: DOMStringMap })
					| null;
				if (canvasEl) canvasEl.dataset.suppressClearUntil = String(Date.now() + 150);
			}
		};
		document.addEventListener("pointermove", move);
		document.addEventListener("pointerup", up, { once: true });
	};
	const size = active ? 22 : 18;
	const touchSize = 44; // Apple's recommended minimum touch target
	return (
		<div
			className="absolute flex flex-row w-full justify-center items-center"
			style={{ top: -80, height: 160, pointerEvents: "auto" }}
			onPointerDown={onPointerDown}
			data-rotate-handle
		>
			{/* Larger invisible touch area */}
			<div
				style={{
					width: touchSize,
					height: touchSize,
					position: "absolute",
					top: 80 - touchSize / 2,
					left: "50%",
					transform: "translateX(-50%)",
					backgroundColor: "transparent",
				}}
			/>
			{/* Visible knob */}
			<div
				className="bg-black shadow-lg z-[9998] cursor-grab"
				style={{
					width: size,
					height: size,
					borderRadius: "50%",
					position: "absolute",
					top: 80 - size / 2,
					left: "50%",
					transform: "translateX(-50%)",
					pointerEvents: "none", // Let the larger touch area handle events
				}}
			/>
		</div>
	);
}

// ============================================================================
// Resize (shapes only)
// ============================================================================
export function CornerResizeHandles({
	item,
	padding,
	onResizeEnd,
}: {
	item: Item;
	padding: number;
	onResizeEnd?: () => void;
}) {
	const handler = getContentHandler(item);
	if (!handler.canResize() || !isShape(item)) return <></>;
	const shape = item.content;
	useTree(shape);
	const presence = useContext(PresenceContext);
	const [resizing, setResizing] = useState(false);
	const initSize = useRef(shape.size);
	const centerModel = useRef({ x: 0, y: 0 });
	const centerScreen = useRef({ x: 0, y: 0 });
	const initDist = useRef(0);
	const initVec = useRef({ dx: 0, dy: 0 });
	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		setResizing(true);
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			/* unsupported */
		}
		// Seed resize presence so pan guard sees active manipulation instantly
		presence.resize.setResizing({ id: item.id, x: item.x, y: item.y, size: shape.size });
		document.documentElement.dataset.manipulating = "1";
		initSize.current = shape.size;
		centerModel.current = { x: item.x + shape.size / 2, y: item.y + shape.size / 2 };
		let el: HTMLElement | null = e.currentTarget.parentElement;
		while (el && !el.getAttribute("data-item-id")) el = el.parentElement;
		if (el) {
			const r = el.getBoundingClientRect();
			centerScreen.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
		}
		initVec.current = {
			dx: e.clientX - centerScreen.current.x,
			dy: e.clientY - centerScreen.current.y,
		};
		initDist.current = Math.sqrt(initVec.current.dx ** 2 + initVec.current.dy ** 2);
		const move = (ev: PointerEvent) => {
			const dx = ev.clientX - centerScreen.current.x;
			const dy = ev.clientY - centerScreen.current.y;
			const dot = dx * initVec.current.dx + dy * initVec.current.dy;
			const initMagSq = initVec.current.dx ** 2 + initVec.current.dy ** 2;
			const proj = dot / Math.sqrt(initMagSq || 1);
			const ratio = Math.max(0.1, proj / initDist.current);
			// Increased max size from 300 to 1200 (4x) to match expanded shape size limits
			const desired = initSize.current * ratio;
			const newSize = clampShapeSize(desired);
			const newX = centerModel.current.x - newSize / 2;
			const newY = centerModel.current.y - newSize / 2;
			presence.resize.setResizing({ id: item.id, x: newX, y: newY, size: newSize });
		};
		const up = () => {
			setResizing(false);
			document.removeEventListener("pointermove", move);
			try {
				(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
			} catch {
				/* ignore */
			}
			delete document.documentElement.dataset.manipulating;
			const r = presence.resize.state.local;
			if (r && r.id === item.id) {
				Tree.runTransaction(item, () => {
					shape.size = r.size;
					item.x = r.x;
					item.y = r.y;
				});
			}
			presence.resize.clearResizing();
			onResizeEnd?.();
			const canvasEl = document.getElementById("canvas") as
				| (SVGSVGElement & { dataset: DOMStringMap })
				| null;
			if (canvasEl) canvasEl.dataset.suppressClearUntil = String(Date.now() + 150);
		};
		document.addEventListener("pointermove", move);
		document.addEventListener("pointerup", up, { once: true });
	};
	const pos = (p: string) => {
		const o = resizing ? 10 : 8; // enlarged for touch
		switch (p) {
			case "top-left":
				return { left: -padding - o, top: -padding - o };
			case "top-right":
				return { right: -padding - o, top: -padding - o };
			case "bottom-left":
				return { left: -padding - o, bottom: -padding - o };
			case "bottom-right":
				return { right: -padding - o, bottom: -padding - o };
			default:
				return {};
		}
	};
	const Handle = ({ position }: { position: string }) => {
		// Wrapper large zone
		const zone = pos(position);
		const WRAP = 120; // large square zone for touch
		const wrapStyle: React.CSSProperties = {
			position: "absolute",
			width: WRAP,
			height: WRAP,
			pointerEvents: "auto",
			touchAction: "none",
			...zone,
			// shift so small handle remains at corner while wrapper extends inward
		};
		const handleSize = resizing ? 30 : 26;
		const adjust = (v: number) => v - (WRAP - handleSize) / 2;
		if (Object.prototype.hasOwnProperty.call(zone, "left"))
			wrapStyle.left = adjust((zone as Record<string, number>).left);
		if (Object.prototype.hasOwnProperty.call(zone, "right"))
			wrapStyle.right = adjust((zone as Record<string, number>).right);
		if (Object.prototype.hasOwnProperty.call(zone, "top"))
			wrapStyle.top = adjust((zone as Record<string, number>).top);
		if (Object.prototype.hasOwnProperty.call(zone, "bottom"))
			wrapStyle.bottom = adjust((zone as Record<string, number>).bottom);
		return (
			<div data-resize-handle style={wrapStyle} onPointerDown={onPointerDown}>
				<div
					className="absolute bg-black cursor-nw-resize hover:bg-black shadow-lg z-[9998]"
					style={{
						width: resizing ? 30 : 26,
						height: resizing ? 30 : 26,
						borderRadius: 6,
						pointerEvents: "none",
						// Place at corner inside wrapper
						[position.includes("right") ? "right" : "left"]: 0,
						[position.includes("bottom") ? "bottom" : "top"]: 0,
					}}
				/>
			</div>
		);
	};
	return (
		<>
			<Handle position="top-left" />
			<Handle position="top-right" />
			<Handle position="bottom-left" />
			<Handle position="bottom-right" />
		</>
	);
}

// ============================================================================
// Remote selection indicators
// ============================================================================
interface ConnectedUser {
	value: { name: string; id: string; image?: string };
	client: { attendeeId: string };
}
export function RemoteSelectionIndicators({
	remoteSelectedUsers,
}: {
	remoteSelectedUsers: string[];
}) {
	const presence = useContext(PresenceContext);
	const [expanded, setExpanded] = useState(false);
	if (!remoteSelectedUsers.length) return <></>;
	const connected = presence.users.getConnectedUsers().map((u) => ({
		value: {
			name: u.value.name,
			id: u.value.id,
			image: "image" in u.value ? (u.value as { image?: string }).image : undefined,
		},
		client: { attendeeId: u.client.attendeeId },
	})) as ConnectedUser[];
	const users: ConnectedUser[] = remoteSelectedUsers
		.map((id) => connected.find((u) => u.client.attendeeId === id)!)
		.filter((u): u is ConnectedUser => !!u);
	if (!users.length) return <></>;
	if (users.length === 1)
		return (
			<div
				className="absolute pointer-events-none"
				style={{ top: 0, right: 0, zIndex: 1005 }}
			>
				<RemoteUserIndicator user={users[0]} index={0} />
			</div>
		);
	return (
		<div className="absolute" style={{ top: 0, right: 0, zIndex: 1005 }}>
			{expanded ? (
				<div className="pointer-events-none relative">
					{users.map((u, i) => (
						<div
							key={u.client.attendeeId}
							className="transition-all duration-300 ease-out"
							style={{
								transform: `translateX(${expanded ? 0 : 20}px)`,
								opacity: expanded ? 1 : 0,
								transitionDelay: `${i * 50}ms`,
							}}
						>
							<RemoteUserIndicator user={u} index={i} />
						</div>
					))}
					<div
						className="absolute pointer-events-auto cursor-pointer w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200 border-2 border-white shadow-lg flex items-center justify-center"
						style={{
							top: -12,
							right: -12 - users.length * 26,
							zIndex: 1006,
							transform: `scale(${expanded ? 1 : 0})`,
							opacity: expanded ? 1 : 0,
							transitionDelay: `${users.length * 50}ms`,
						}}
						onClick={(e) => {
							e.stopPropagation();
							setExpanded(false);
						}}
						title="Collapse user list"
					>
						<ChevronLeft16Filled className="text-white" />
					</div>
				</div>
			) : (
				<div
					className="transition-all duration-300 ease-out"
					style={{ transform: `scale(${expanded ? 0 : 1})`, opacity: expanded ? 0 : 1 }}
				>
					<UserCountBadge
						userCount={users.length}
						users={users}
						onExpand={() => setExpanded(true)}
					/>
				</div>
			)}
		</div>
	);
}
function UserCountBadge({
	userCount,
	users,
	onExpand,
}: {
	userCount: number;
	users: Array<{
		value: { name: string; id: string; image?: string };
		client: { attendeeId: string };
	}>;
	onExpand: () => void;
}) {
	const tip =
		users
			.slice(0, 3)
			.map((u) => u.value.name)
			.join(", ") +
		(userCount > 3 ? ` and ${userCount - 3} more` : "") +
		" selected this item";
	return (
		<div
			className="pointer-events-auto cursor-pointer flex items-center justify-center text-white text-xs font-semibold rounded-full bg-black hover:bg-gray-800 transition-colors duration-200 border-2 border-white shadow-lg hover:shadow-xl"
			style={{
				width: 24,
				height: 24,
				position: "absolute",
				top: -12,
				right: -12,
				zIndex: 1005,
			}}
			title={tip}
			onClick={(e) => {
				e.stopPropagation();
				onExpand();
			}}
		>
			{userCount}
		</div>
	);
}
function RemoteUserIndicator({
	user,
	index,
}: {
	user: { value: { name: string; id: string; image?: string }; client: { attendeeId: string } };
	index: number;
}) {
	const i = initials(user.value.name);
	const c = userColor(user.client.attendeeId);
	const off = index * 26;
	return (
		<div
			className="flex items-center justify-center text-white font-semibold rounded-full border-2 border-white shadow-lg"
			style={{
				width: 24,
				height: 24,
				backgroundColor: c,
				position: "absolute",
				top: -12,
				right: -12 - off,
				zIndex: 1005,
				fontSize: 10,
				lineHeight: "1",
			}}
			title={`Selected by ${user.value.name}`}
		>
			{i}
		</div>
	);
}
