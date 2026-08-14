/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useRef, useState, useEffect } from "react";
/**
 * Canvas component
 * -------------------------------------------------------------
 * This file implements the collaborative drawing / layout surface.
 * Responsibilities:
 * 1. Coordinate system management (pan + zoom) via useCanvasNavigation hook.
 * 2. Two-layer rendering strategy:
 *    - SVG layer: scalable content (ink + selection + presence overlays).
 *    - HTML foreignObject layer: React DOM for complex items (tables, notes, shapes).
 * 3. Ephemeral inking (local + remote) using the Presence API (no persistence until stroke commit).
 * 4. Persistent ink commit into SharedTree schema (`App.inks`).
 * 5. Eraser hit-testing using a zoom-aware circular cursor.
 * 6. Selection / presence overlays (only re-rendering when underlying presence keys change).
 *
 * Coordinate Spaces:
 * - Screen space: raw pointer clientX/clientY (pixels in viewport).
 * - Canvas space: screen adjusted by <svg> boundingClientRect.
 * - Logical space: pan+zoom transformed coordinates used for ink persistence.
 *   logical = (screen - pan) / zoom
 *
 * Performance Considerations:
 * - Pointer inking uses coalesced events (when supported) to capture high‑resolution input without flooding React.
 * - Points are stored in a ref array (`tempPointsRef`) and broadcast at most once per animation frame to presence.
 * - Batching final stroke commit inside a SharedTree transaction.
 * - Presence driven overlays subscribe with keys (`selKey`, `motionKey`) to minimize diff churn.
 *
 * Presence vs Persistent Ink:
 * - While drawing: stroke exists only in presence (ephemeral) so other users see it immediately.
 * - On pointer up: stroke is converted into a persistent `InkStroke` (schema object) and appended to `App.inks`.
 * - Remote ephemerals are rendered translucently; committed strokes are opaque.
 *
 * Erasing (current implementation):
 * - Simple hit test deletes the first stroke that intersects the eraser circle.
 * - Future enhancement: partial segment splitting (prototype attempted earlier) and adjustable eraser size.
 *
 * Cursor Rendering:
 * - Logical ink width is scaled by zoom for visual accuracy, but polyline uses vectorEffect="non-scaling-stroke" to retain crispness.
 * - Custom circle overlay drawn in screen space for ink / eraser feedback.
 */
import {
	Items,
	Item,
	InkStroke,
	InkPoint,
	InkStyle,
	InkBBox,
	App,
} from "../../../schema/appSchema.js";
import { Tree } from "fluid-framework";
import { IFluidContainer } from "fluid-framework";
import { PresenceContext } from "../../contexts/PresenceContext.js";
// ItemView moved into ItemsHtmlLayer
import { useTree } from "../../hooks/useTree.js";
import { LayoutContext } from "../../hooks/useLayoutManger.js";
import { SelectionOverlay } from "../../overlays/SelectionOverlay.js";
import { PresenceOverlay } from "../../overlays/PresenceOverlay.js";
import { CommentOverlay } from "../../overlays/CommentOverlay.js";
import { CursorOverlay } from "../../overlays/CursorOverlay.js";
import { useCanvasNavigation } from "../../hooks/useCanvasNavigation.js";
import { useOverlayRerenders } from "../../hooks/useOverlayRerenders.js";
import { ItemsHtmlLayer } from "./ItemsHtmlLayer.js";
import { PaneContext } from "../../contexts/PaneContext.js";

export function Canvas(props: {
	items: Items;
	container: IFluidContainer;
	setSize: (width: number, height: number) => void;
	zoom?: number;
	onZoomChange?: (z: number) => void;
	onPanChange?: (p: { x: number; y: number }) => void;
	inkActive?: boolean;
	eraserActive?: boolean;
	inkColor?: string;
	inkWidth?: number;
}): JSX.Element {
	const {
		items,
		container, // eslint-disable-line @typescript-eslint/no-unused-vars
		setSize,
		zoom: externalZoom,
		onZoomChange,
		onPanChange,
		inkActive,
		eraserActive,
		inkColor = "#2563eb",
		inkWidth = 4,
	} = props;

	// Global presence context (ephemeral collaboration state: selections, drags, ink, etc.)
	const presence = useContext(PresenceContext);
	useTree(items);
	const layout = useContext(LayoutContext);

	const svgRef = useRef<SVGSVGElement>(null);
	// Freehand ink capture lifecycle:
	// 1. pointerDown -> start stroke (local ephemeral + presence broadcast)
	// 2. pointerMove -> accumulate points (filtered) & throttle presence update via rAF
	// 3. pointerUp/Cancel -> commit to SharedTree + clear presence
	const [inking, setInking] = useState(false);
	const tempPointsRef = useRef<InkPoint[]>([]);
	const pointerIdRef = useRef<number | null>(null);
	const pointerTypeRef = useRef<string | null>(null);
	const lastPointRef = useRef<{ x: number; y: number } | null>(null);
	const strokeIdRef = useRef<string | null>(null);
	const {
		canvasPosition,
		pan,
		zoom,
		isPanning,
		beginPanIfBackground,
		handleHtmlBackgroundMouseDown,
		handleBackgroundClick,
	} = useCanvasNavigation({
		svgRef,
		presence,
		setSize,
		externalZoom,
		onZoomChange,
	});
	const { selKey, motionKey } = useOverlayRerenders(presence);
	// Track expanded state for presence indicators per item
	const [expandedPresence, setExpandedPresence] = useState<Set<string>>(new Set());
	// Screen-space cursor for ink / eraser
	const [cursor, setCursor] = useState<{ x: number; y: number; visible: boolean }>({
		x: 0,
		y: 0,
		visible: false,
	});
	// Hovered stroke (eraser preview)
	const [eraserHoverId, setEraserHoverId] = useState<string | null>(null);

	// Collaborative cursor tracking
	useEffect(() => {
		const svgElement = svgRef.current;
		if (!svgElement) return;

		const handleMouseMove = (event: MouseEvent) => {
			// Convert screen coordinates to canvas coordinates
			const rect = svgElement.getBoundingClientRect();
			const canvasX = event.clientX - rect.left;
			const canvasY = event.clientY - rect.top;

			// Convert to logical coordinates (accounting for pan and zoom)
			const logicalX = (canvasX - pan.x) / zoom;
			const logicalY = (canvasY - pan.y) / zoom;

			// Update collaborative cursor position
			presence.cursor?.setCursorPosition(logicalX, logicalY);
		};

		const handleMouseEnter = () => {
			// Show collaborative cursor when mouse enters canvas
			presence.cursor?.showCursor();
		};

		const handleMouseLeave = () => {
			// Hide collaborative cursor when mouse leaves canvas
			presence.cursor?.hideCursor();
		};

		// Add event listeners
		svgElement.addEventListener("mousemove", handleMouseMove);
		svgElement.addEventListener("mouseenter", handleMouseEnter);
		svgElement.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			// Cleanup event listeners
			svgElement.removeEventListener("mousemove", handleMouseMove);
			svgElement.removeEventListener("mouseenter", handleMouseEnter);
			svgElement.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [pan.x, pan.y, zoom, presence.cursor]);

	// Hovered stroke (eraser preview)

	// Helpers for presence indicator visuals
	const getInitials = (name: string): string => {
		if (!name) return "?";
		const words = name.trim().split(/\s+/);
		return words.length === 1
			? words[0].charAt(0).toUpperCase()
			: (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
	};

	const getUserColor = (userId: string): string => {
		const colors = [
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
			"#06b6d4",
			"#14b8a6",
			"#a855f7",
			"#0ea5e9",
		];
		let hash = 0;
		for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
		return colors[Math.abs(hash) % colors.length];
	};

	const paneContext = useContext(PaneContext);

	// Layout version to trigger overlay re-renders when intrinsic sizes change (e.g., table growth)
	const [layoutVersion, setLayoutVersion] = useState(0);
	useEffect(() => {
		const handler = () => setLayoutVersion((v) => v + 1);
		window.addEventListener("layout-changed", handler);
		return () => window.removeEventListener("layout-changed", handler);
	}, []);

	const commentPaneVisible =
		paneContext.panes.find((p) => p.name === "comments")?.visible ?? false;

	// Get root App via Tree API (more robust than accessing .parent directly)
	const root = ((): App | undefined => {
		// Tree.parent(items) returns the parent node, expected to be App
		try {
			const p = Tree.parent(items);
			return p instanceof App ? (p as App) : (p as unknown as App | undefined);
		} catch {
			return undefined;
		}
	})();
	const inksNode = root?.inks; // SharedTree field storing persistent InkStroke objects
	// Stable hook ordering: call a dummy state hook first, then conditionally subscribe
	const [dummy] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
	if (inksNode) {
		useTree(inksNode, true);
	}
	const inksIterable = inksNode ?? [];

	// Notify parent of pan changes (for ink coordinate calculations)
	useEffect(() => {
		if (onPanChange) onPanChange(pan);
	}, [pan, onPanChange]);

	// Convert screen coords (client) into logical content coordinates.
	// logical = (screenWithinSvg - pan) / zoom; used for storing ink points invariant to zoom level.
	const toLogical = (clientX: number, clientY: number): { x: number; y: number } => {
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		const sx = clientX - rect.left;
		const sy = clientY - rect.top;
		return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
	};

	// Erase helper (simple deletion): removes the first stroke whose polyline (inflated by stroke width)
	// intersects the eraser logical circle. This is O(N * M) where N=strokes, M=points per stroke; fast enough
	// for typical collaborative canvases. Bounding box check performs coarse rejection before segment math.
	const performErase = (p: { x: number; y: number }) => {
		if (!root?.inks) return;
		const eraserScreenRadius = 12; // cursor visual radius
		const eraserLogicalRadius = eraserScreenRadius / zoom;
		let target: InkStroke | undefined;
		outer: for (const s of root.inks) {
			const bb = s.bbox;
			if (!bb) continue;
			if (
				p.x < bb.x - eraserLogicalRadius ||
				p.x > bb.x + bb.w + eraserLogicalRadius ||
				p.y < bb.y - eraserLogicalRadius ||
				p.y > bb.y + bb.h + eraserLogicalRadius
			)
				continue;
			const pts = Array.from(s.simplified ?? s.points) as InkPoint[];
			const strokeHalf = (s.style?.strokeWidth ?? 4) / 2;
			const maxDist = strokeHalf + eraserLogicalRadius;
			const maxDist2 = maxDist * maxDist;
			for (let i = 0; i < pts.length - 1; i++) {
				const a = pts[i];
				const b = pts[i + 1];
				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const len2 = dx * dx + dy * dy;
				let t = 0;
				if (len2 > 0) {
					const proj = (p.x - a.x) * dx + (p.y - a.y) * dy;
					t = Math.max(0, Math.min(1, proj / len2));
				}
				const cx = a.x + dx * t;
				const cy = a.y + dy * t;
				const ddx = p.x - cx;
				const ddy = p.y - cy;
				if (ddx * ddx + ddy * ddy <= maxDist2) {
					target = s;
					break outer;
				}
			}
		}
		if (target) {
			Tree.runTransaction(root.inks, () => {
				const idx = root.inks.indexOf(target!);
				if (idx >= 0) root.inks.removeAt(idx);
			});
		}
	};

	// Begin inking on left button background press (not on items)
	const handlePointerMove = (e: React.PointerEvent) => {
		// Update cursor visibility + optionally perform erase scrubbing.
		if (!(inkActive || eraserActive)) {
			if (cursor.visible) setCursor((c) => ({ ...c, visible: false }));
			if (eraserHoverId) setEraserHoverId(null);
			return;
		}
		const targetEl = e.target as Element | null;
		if (targetEl?.closest("[data-item-id], [data-svg-item-id]")) {
			if (cursor.visible) setCursor((c) => ({ ...c, visible: false }));
			if (eraserHoverId) setEraserHoverId(null);
			return;
		}
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;
		setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });

		// Update collaborative cursor position
		const logicalX = (e.clientX - rect.left - pan.x) / zoom;
		const logicalY = (e.clientY - rect.top - pan.y) / zoom;
		presence.cursor?.setCursorPosition(logicalX, logicalY);

		// If erasing, update hover or scrub
		if (eraserActive && root?.inks) {
			const pLogical = toLogical(e.clientX, e.clientY);
			if (pointerIdRef.current !== null) {
				// Active drag: continuously erase
				performErase(pLogical);
				setEraserHoverId(null);
			} else {
				// Hover preview using circle radius
				let target: InkStroke | undefined;
				const eraserScreenRadius = 12;
				const eraserLogicalRadius = eraserScreenRadius / zoom;
				outer: for (const s of root.inks) {
					const bb = s.bbox;
					if (!bb) continue;
					if (
						pLogical.x < bb.x - eraserLogicalRadius ||
						pLogical.x > bb.x + bb.w + eraserLogicalRadius ||
						pLogical.y < bb.y - eraserLogicalRadius ||
						pLogical.y > bb.y + bb.h + eraserLogicalRadius
					)
						continue;
					const pts = Array.from(s.simplified ?? s.points) as InkPoint[];
					const strokeHalf = (s.style?.strokeWidth ?? 4) / 2;
					const maxDist = strokeHalf + eraserLogicalRadius;
					const maxDist2 = maxDist * maxDist;
					for (let i = 0; i < pts.length - 1; i++) {
						const a = pts[i];
						const b = pts[i + 1];
						const dx = b.x - a.x;
						const dy = b.y - a.y;
						const len2 = dx * dx + dy * dy;
						let t = 0;
						if (len2 > 0) {
							const proj = (pLogical.x - a.x) * dx + (pLogical.y - a.y) * dy;
							t = Math.max(0, Math.min(1, proj / len2));
						}
						const cx = a.x + dx * t;
						const cy = a.y + dy * t;
						const ddx = pLogical.x - cx;
						const ddy = pLogical.y - cy;
						if (ddx * ddx + ddy * ddy <= maxDist2) {
							target = s;
							break outer;
						}
					}
				}
				setEraserHoverId(target ? target.id : null);
			}
		}
	};

	const handlePointerUp = (e: React.PointerEvent) => {
		if (pointerIdRef.current !== null && e.pointerId === pointerIdRef.current) {
			pointerIdRef.current = null;
		}
	};

	const handlePointerLeave = () => setCursor((c) => ({ ...c, visible: false }));

	// During active inking we subscribe to raw pointermove on document (outside React) for performance
	// and to avoid losing events when pointer exits the SVG temporarily.
	useEffect(() => {
		if (!inking) return;
		const handleMove = (ev: PointerEvent) => {
			// Skip events from other concurrent pointers (multi-touch scenarios)
			if (pointerIdRef.current !== null && ev.pointerId !== pointerIdRef.current) return;

			// Update cursor position for collaborative cursors
			const logicalPos = toLogical(ev.clientX, ev.clientY);
			presence.cursor?.setCursorPosition(logicalPos.x, logicalPos.y);

			// Use coalesced events for smoother touch / pen input when available
			const hasCoalesced = (
				e: PointerEvent
			): e is PointerEvent & { getCoalescedEvents(): PointerEvent[] } =>
				typeof (e as PointerEvent & { getCoalescedEvents?: unknown }).getCoalescedEvents ===
				"function";
			const events = hasCoalesced(ev) ? ev.getCoalescedEvents() : [ev];
			for (const cev of events) {
				const p = toLogical(cev.clientX, cev.clientY);
				const last = lastPointRef.current;
				// Adaptive point thinning: allow denser sampling for touch (smoother curves) vs mouse/pen
				const isTouch = pointerTypeRef.current === "touch";
				const minDist2 = isTouch ? 0.5 : 4; // ~0.7px for touch vs 2px for mouse/pen
				if (last) {
					const dx = p.x - last.x;
					const dy = p.y - last.y;
					if (dx * dx + dy * dy < minDist2) continue;
				}
				lastPointRef.current = p;
				tempPointsRef.current.push(new InkPoint({ x: p.x, y: p.y, t: Date.now() }));
			}
			// Throttle presence broadcast to at most one per animation frame.
			if (!pendingRaf.current) {
				pendingRaf.current = requestAnimationFrame(() => {
					pendingRaf.current = 0;
					if (presence.ink?.state.local && strokeIdRef.current) {
						presence.ink.updateStroke(
							tempPointsRef.current.map((pt) => ({ x: pt.x, y: pt.y, t: pt.t }))
						);
					}
				});
			}
		};
		const handleUpOrCancel = (ev: PointerEvent) => {
			// Commit stroke to persistent model; clear ephemeral presence.
			if (pointerIdRef.current !== null && ev.pointerId !== pointerIdRef.current) return;
			if (!inking) return;
			setInking(false);
			pointerIdRef.current = null;
			pointerTypeRef.current = null;
			lastPointRef.current = null;
			const pts = tempPointsRef.current;
			if (pts.length < 2 || !root?.inks) {
				tempPointsRef.current = [];
				presence.ink?.clearStroke();
				return;
			}
			const minX = Math.min(...pts.map((p) => p.x));
			const maxX = Math.max(...pts.map((p) => p.x));
			const minY = Math.min(...pts.map((p) => p.y));
			const maxY = Math.max(...pts.map((p) => p.y));
			const stroke = new InkStroke({
				id: crypto.randomUUID(),
				points: pts.slice(),
				style: new InkStyle({
					strokeColor: inkColor,
					strokeWidth: inkWidth,
					opacity: 1,
					lineCap: "round",
					lineJoin: "round",
				}),
				bbox: new InkBBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY }),
			});
			root.inks.insertAtEnd(stroke);
			tempPointsRef.current = [];
			presence.ink?.clearStroke();
			strokeIdRef.current = null;
		};
		const pendingRaf = { current: 0 as number | 0 } as { current: number | 0 };
		document.addEventListener("pointermove", handleMove);
		document.addEventListener("pointerup", handleUpOrCancel, { capture: true });
		document.addEventListener("pointercancel", handleUpOrCancel, { capture: true });
		return () => {
			document.removeEventListener("pointermove", handleMove);
			document.removeEventListener("pointerup", handleUpOrCancel, { capture: true });
			document.removeEventListener("pointercancel", handleUpOrCancel, { capture: true });
		};
	}, [inking, root]);

	return (
		<div className="relative h-full w-full">
			{/* Background dots layer - HTML/CSS for consistent behavior across all platforms */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(circle, #6b7280 1px, transparent 1px)`,
					backgroundSize: `${48 * zoom}px ${48 * zoom}px`,
					backgroundPosition: `${pan.x}px ${pan.y}px`,
					pointerEvents: "none",
				}}
			/>

			<svg
				id="canvas"
				data-canvas-root="true"
				ref={svgRef}
				className="canvas-svg absolute inset-0 h-full w-full bg-transparent"
				style={{
					touchAction: "none",
					cursor: isPanning ? "grabbing" : undefined,
					pointerEvents: "auto",
				}}
				onClick={(e) => handleBackgroundClick(e)}
				onPointerUp={(e) => {
					// Handle tap-to-clear-selection for touch events (equivalent to onClick for mouse)
					if (e.pointerType === "touch") {
						const target = e.target as Element | null;

						// Check if this is on an item or a resize/rotate handle
						const isOnItem =
							target?.closest("[data-item-id]") ||
							target?.closest("[data-svg-item-id]");
						const isOnHandle =
							target?.closest("[data-resize-handle]") ||
							target?.closest("[data-rotate-handle]");

						// Check if we're currently or recently manipulating something
						// This prevents clearing selection when touch events bubble up from manipulation operations
						const isManipulating = !!document.documentElement.dataset.manipulating;
						const hasResizeState = !!presence.resize.state?.local;
						const hasDragState = !!presence.drag.state.local;

						// Only clear selection if tapping on background AND not during/after manipulation
						if (
							!isOnItem &&
							!isOnHandle &&
							!isManipulating &&
							!hasResizeState &&
							!hasDragState
						) {
							// For touch events, respect suppressClearUntil flag like mouse events do
							const svg = svgRef.current as
								| (SVGSVGElement & { dataset: DOMStringMap })
								| null;
							const until = svg?.dataset?.suppressClearUntil
								? parseInt(svg.dataset.suppressClearUntil)
								: 0;
							if (until && Date.now() < until) {
								if (svg) delete svg.dataset.suppressClearUntil;
								return;
							}
							presence.itemSelection?.clearSelection();
						}
					}
					handlePointerUp(e);
				}}
				onPointerDown={(e) => {
					// Check if something is already being manipulated
					if (document.documentElement.dataset.manipulating) {
						return;
					}

					// Check if this is a handle interaction - if so, don't interfere
					const target = e.target as Element | null;
					const isHandle = target?.closest("[data-resize-handle], [data-rotate-handle]");
					if (isHandle) {
						// Let the handle component deal with this event
						return;
					}

					// For touch events, check if we're touching an item first
					if (e.pointerType === "touch") {
						const isOnItem =
							target?.closest("[data-item-id]") ||
							target?.closest("[data-svg-item-id]");

						// Only allow panning if not on an item and not in ink/eraser mode
						if (!isOnItem && !(inkActive || eraserActive)) {
							beginPanIfBackground(e);
						}
					} else {
						// For non-touch (mouse), use original logic
						if (!(inkActive || eraserActive)) beginPanIfBackground(e);
					}

					// Manage three mutually exclusive interactions: inking, erasing, panning(right mouse handled upstream).
					if (inkActive || eraserActive) {
						if (target?.closest("[data-item-id], [data-svg-item-id]")) {
							// Suppress cursor over items
							setCursor((c) => ({ ...c, visible: false }));
						} else {
							const rect = svgRef.current?.getBoundingClientRect();
							if (rect)
								setCursor({
									x: e.clientX - rect.left,
									y: e.clientY - rect.top,
									visible: true,
								});
						}
					}
					pointerTypeRef.current = e.pointerType;

					// Eraser mode: on pointer down start erase interaction instead of drawing
					if (eraserActive) {
						if (e.button !== 0) return;
						// Clear selection when starting to erase (same as mouse click behavior)
						presence.itemSelection?.clearSelection();
						pointerIdRef.current = e.pointerId; // track drag for scrubbing
						performErase(toLogical(e.clientX, e.clientY));
						return; // don't start ink
					}

					if (!inkActive) return; // only when ink tool active
					if (e.button !== 0) return; // left only

					// Ignore if clicked on an item or existing selectable element
					if (target?.closest("[data-item-id]")) return;
					if (target?.closest("[data-svg-item-id]")) return;

					// Clear selection when starting to ink on background (same as mouse click behavior)
					presence.itemSelection?.clearSelection();

					// Start inking
					const p = toLogical(e.clientX, e.clientY);
					pointerIdRef.current = e.pointerId;
					setInking(true);
					tempPointsRef.current = [new InkPoint({ x: p.x, y: p.y, t: Date.now() })];
					lastPointRef.current = p;
					strokeIdRef.current = crypto.randomUUID();
					// Broadcast initial presence stroke (ephemeral only, not yet committed)
					presence.ink?.setStroke({
						id: strokeIdRef.current,
						points: tempPointsRef.current.map((pt) => ({ x: pt.x, y: pt.y, t: pt.t })),
						color: inkColor,
						width: inkWidth,
						opacity: 1,
						startTime: Date.now(),
					});
					e.preventDefault();
				}}
				onPointerMove={handlePointerMove}
				onPointerLeave={handlePointerLeave}
				onContextMenu={(e) => {
					// Always suppress default context menu on canvas
					e.preventDefault();
				}}
			>
				{/* Full-size HTML layer hosting existing item views */}
				<foreignObject x={0} y={0} width="100%" height="100%">
					{/* Full-size wrapper to capture background drags anywhere inside the foreignObject */}
					<div
						className="relative h-full w-full"
						onMouseDown={handleHtmlBackgroundMouseDown}
						onContextMenu={(e) => {
							e.preventDefault();
						}}
						onDragOver={(e) => {
							e.preventDefault();
							e.dataTransfer.dropEffect = "move";
						}}
						style={{
							userSelect: "none",
							position: "relative",
						}}
					>
						<ItemsHtmlLayer
							items={items}
							canvasPosition={canvasPosition}
							pan={pan}
							zoom={zoom}
						/>
					</div>
				</foreignObject>
				{/* Ink rendering layer - positioned after items for consistent layering */}
				<g
					transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
					pointerEvents="none"
					data-layer="ink"
				>
					{Array.from(inksIterable).map((s: InkStroke) => {
						const pts = Array.from(s.simplified ?? s.points) as InkPoint[];
						if (!pts.length) return null;
						const base = s.style?.strokeWidth ?? 4;
						const w = Math.max(0.5, base * zoom);
						return (
							<g key={s.id}>
								<polyline
									fill="none"
									stroke={s.style?.strokeColor ?? "#000"}
									strokeWidth={w}
									strokeOpacity={s.style?.opacity ?? 1}
									strokeLinecap={"round"}
									strokeLinejoin={"round"}
									vectorEffect="non-scaling-stroke"
									points={pts.map((p: InkPoint) => `${p.x},${p.y}`).join(" ")}
								/>
							</g>
						);
					})}
					{/* Eraser hover highlight (draw after base strokes) */}
					{eraserActive &&
						eraserHoverId &&
						(() => {
							const stroke = Array.from(inksIterable).find(
								(s: InkStroke) => s.id === eraserHoverId
							);
							if (!stroke) return null;
							const pts = Array.from(
								stroke.simplified ?? stroke.points
							) as InkPoint[];
							if (!pts.length) return null;
							return (
								<polyline
									key={`hover-${stroke.id}`}
									fill="none"
									stroke="#dc2626"
									strokeWidth={Math.max(
										0.5,
										(stroke.style?.strokeWidth ?? 4) * zoom + 2
									)}
									strokeOpacity={0.9}
									strokeLinecap="round"
									strokeLinejoin="round"
									vectorEffect="non-scaling-stroke"
									strokeDasharray="4 3"
									points={pts.map((p: InkPoint) => `${p.x},${p.y}`).join(" ")}
								/>
							);
						})()}
					{/* Remote ephemeral strokes */}
					{presence.ink?.getRemoteStrokes().map((r) => {
						const pts = r.stroke.points;
						if (!pts.length) return null;
						const w = Math.max(0.5, r.stroke.width * zoom);
						return (
							<polyline
								key={`ephemeral-${r.attendeeId}`}
								fill="none"
								stroke={r.stroke.color}
								strokeWidth={w}
								strokeOpacity={0.4}
								strokeLinecap="round"
								strokeLinejoin="round"
								vectorEffect="non-scaling-stroke"
								points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
							/>
						);
					})}
					{/* Local ephemeral (if drawing) */}
					{inking && tempPointsRef.current.length > 0 && (
						<polyline
							key="local-ephemeral"
							fill="none"
							stroke={inkColor}
							strokeWidth={Math.max(0.5, inkWidth * zoom)}
							strokeOpacity={0.7}
							strokeLinecap="round"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
							points={tempPointsRef.current.map((p) => `${p.x},${p.y}`).join(" ")}
						/>
					)}
				</g>
				{/* Per-item SVG wrappers (overlay), built from measured layout */}
				<g
					key={`sel-${selKey}-${motionKey}-${layoutVersion}`}
					transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
					style={{ pointerEvents: "auto", touchAction: "none" }}
					data-layer="selection-overlays"
				>
					{items.map((item) => {
						if (!(item instanceof Item)) return null;
						const isSelected = presence.itemSelection?.testSelection({ id: item.id });
						if (!isSelected) return null; // only draw selection overlays for selected items
						return (
							<SelectionOverlay
								key={`wrap-${item.id}`}
								item={item}
								layout={layout}
								presence={presence}
								zoom={zoom}
							/>
						);
					})}
				</g>
				{/* Presence indicators overlay for all items with remote selections */}
				<g
					key={`presence-${selKey}-${motionKey}-${layoutVersion}`}
					transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
					style={{ pointerEvents: "auto", touchAction: "none" }}
					data-layer="presence-overlays"
				>
					{items.map((item) => {
						if (!(item instanceof Item)) return null;
						const remoteIds =
							presence.itemSelection?.testRemoteSelection({ id: item.id }) ?? [];
						if (!remoteIds.length) return null;
						const isExpanded = expandedPresence.has(item.id);
						const toggleExpanded = (e: React.MouseEvent) => {
							e.stopPropagation();
							setExpandedPresence((prev) => {
								const next = new Set(prev);
								if (next.has(item.id)) next.delete(item.id);
								else next.add(item.id);
								return next;
							});
						};
						return (
							<PresenceOverlay
								key={`presence-${item.id}`}
								item={item}
								layout={layout}
								presence={presence}
								remoteIds={remoteIds}
								zoom={zoom}
								getInitials={getInitials}
								getUserColor={getUserColor}
								expanded={isExpanded}
								onToggleExpanded={toggleExpanded}
							/>
						);
					})}
				</g>
				{/* Comment indicators (zoom-invariant) */}
				<g
					key={`comments-${selKey}-${motionKey}-${layoutVersion}`}
					transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
					style={{ pointerEvents: "auto", touchAction: "none" }}
					data-layer="comment-overlays"
				>
					{items.map((item) => {
						if (!(item instanceof Item)) return null;
						const isSelected =
							presence.itemSelection?.testSelection({ id: item.id }) ?? false;
						return (
							<CommentOverlay
								key={`comment-${item.id}`}
								item={item}
								layout={layout}
								zoom={zoom}
								commentPaneVisible={commentPaneVisible}
								selected={isSelected}
								presence={presence}
							/>
						);
					})}
				</g>
				{/* Screen-space cursor overlay */}
				{cursor.visible && (inkActive || eraserActive) && (
					<g pointerEvents="none">
						{(() => {
							// For ink: radius is half of actual stroke width in screen space.
							// stroke width rendered is zoom * inkWidth (but we clamp min visually earlier when drawing ephemeral lines)
							const screenStrokeWidth = inkWidth * zoom;
							const r = eraserActive ? 12 : Math.max(2, screenStrokeWidth / 2);
							const stroke = eraserActive ? "#dc2626" : inkColor;
							const fill = eraserActive ? "rgba(220,38,38,0.08)" : `${inkColor}22`; // light tint
							return (
								<circle
									cx={cursor.x}
									cy={cursor.y}
									r={r}
									fill={fill}
									stroke={stroke}
									strokeDasharray={eraserActive ? "4 3" : undefined}
									strokeWidth={1}
								/>
							);
						})()}
					</g>
				)}
			</svg>

			{/* Collaborative cursor overlay - rendered at screen coordinates */}
			{presence.cursor && (
				<CursorOverlay
					cursorManager={presence.cursor}
					canvasPosition={svgRef.current?.getBoundingClientRect() || { left: 0, top: 0 }}
					pan={pan}
					zoom={zoom}
					getInitials={getInitials}
					getUserColor={getUserColor}
					presence={presence}
				/>
			)}
		</div>
	);
}
