import { useEffect, useRef, useState } from "react";
import type { PresenceContext } from "../contexts/PresenceContext.js";

// Discrete zoom levels (always includes 1 for 100%)
const ZOOM_STEPS = [
	0.25, 0.33, 0.5, 0.67, 0.75, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.25, 1.35, 1.5, 1.75, 2,
	2.25, 2.5, 3, 3.5, 4,
];

function nearestZoomIndex(z: number) {
	let idx = 0;
	let best = Infinity;
	for (let i = 0; i < ZOOM_STEPS.length; i++) {
		const d = Math.abs(ZOOM_STEPS[i] - z);
		if (d < best) {
			best = d;
			idx = i;
		}
	}
	return idx;
}

export function useCanvasNavigation(params: {
	svgRef: React.RefObject<SVGSVGElement>;
	presence: React.ContextType<typeof PresenceContext>;
	setSize: (w: number, h: number) => void;
	externalZoom?: number;
	onZoomChange?: (z: number) => void;
}) {
	const { svgRef, presence, setSize, externalZoom, onZoomChange } = params;
	const [canvasPosition, setCanvasPosition] = useState({ left: 0, top: 0 });
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [internalZoom, setInternalZoom] = useState(externalZoom ?? 1);
	const zoom = externalZoom ?? internalZoom;
	const [isPanning, setIsPanning] = useState(false);
	const lastPos = useRef<{ x: number; y: number } | null>(null);
	const movedRef = useRef(false);
	// Pinch gesture tracking (touch)
	const activeTouches = useRef<Map<number, { x: number; y: number }>>(new Map());
	const pinchState = useRef<null | {
		initialDistance: number;
		initialCenter: { x: number; y: number };
		initialZoom: number;
		initialPan: { x: number; y: number };
		lastAppliedZoom: number;
	}>(null);

	const clampZoom = (z: number) =>
		Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], z));

	// Wheel zoom with cursor anchoring and discrete steps
	// Note: Non-passive listener is required to preventDefault() and implement custom zoom behavior
	// This prevents browser's default zoom/scroll and allows precise control over canvas zoom
	useEffect(() => {
		const el = svgRef.current;
		if (!el) return;
		const zoomRef = { current: zoom } as { current: number };
		const panRef = { current: pan } as { current: { x: number; y: number } };
		const accumRef = { current: 0 } as { current: number };
		const STEP_TRIGGER = 40; // wheel delta accumulation threshold
		const onWheel = (e: WheelEvent) => {
			// Prevent default browser zoom/scroll to implement custom zoom behavior
			e.preventDefault();
			accumRef.current += e.deltaY;
			if (Math.abs(accumRef.current) < STEP_TRIGGER) return; // wait until threshold reached
			const direction = accumRef.current > 0 ? 1 : -1; // 1 = zoom out, -1 = zoom in
			// retain remainder so fast scroll can step multiple times
			accumRef.current -= STEP_TRIGGER * direction;
			const rect = el.getBoundingClientRect();
			const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
			const currentZoom = zoomRef.current ?? 1;
			let idx = nearestZoomIndex(currentZoom);
			// If current zoom is above the nearest step and scrolling in, move upward appropriately
			if (direction < 0 && currentZoom > ZOOM_STEPS[idx] && idx < ZOOM_STEPS.length - 1) {
				idx++;
			}
			// If current zoom is below the nearest step and scrolling out, move downward
			if (direction > 0 && currentZoom < ZOOM_STEPS[idx] && idx > 0) {
				idx--;
			}
			const newIdx = Math.min(
				ZOOM_STEPS.length - 1,
				Math.max(0, idx - direction) // subtract direction because direction>0 means zoom out
			);
			const newZoom = ZOOM_STEPS[newIdx];
			if (newZoom === currentZoom) return;
			const panNow = panRef.current ?? { x: 0, y: 0 };
			const p = {
				x: (mouse.x - panNow.x) / currentZoom,
				y: (mouse.y - panNow.y) / currentZoom,
			};
			const newPan = { x: mouse.x - newZoom * p.x, y: mouse.y - newZoom * p.y };
			setPan(newPan);
			if (onZoomChange) onZoomChange(newZoom);
			else setInternalZoom(newZoom);
		};
		const updateRefs = () => {
			zoomRef.current = zoom;
			panRef.current = pan;
		};
		updateRefs();
		const raf = requestAnimationFrame(updateRefs);
		// passive: false is required to call preventDefault() and override browser zoom behavior
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener("wheel", onWheel as EventListener);
		};
	}, [svgRef.current, pan, zoom, onZoomChange]);

	// Sync internal zoom with external changes
	useEffect(() => {
		if (externalZoom !== undefined) setInternalZoom(externalZoom);
	}, [externalZoom]);

	// Track canvas size
	const handleResize = () => {
		if (svgRef.current) {
			const { width, height, left, top } = svgRef.current.getBoundingClientRect();
			setSize(width, height);
			setCanvasPosition({ left, top });
		}
	};
	useEffect(() => {
		if (svgRef.current) {
			const { width, height, left, top } = svgRef.current.getBoundingClientRect();
			setSize(width, height);
			setCanvasPosition({ left, top });
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Background click clears selection (unless suppressed or click originated within an item)
	const handleBackgroundClick = (e?: MouseEvent | React.MouseEvent) => {
		const svg = svgRef.current as (SVGSVGElement & { dataset: DOMStringMap }) | null;
		if (!svg) return;

		// If the click target (or composed path) contains an item, skip clearing
		const target = (e?.target as Element | undefined) ?? undefined;
		if (target) {
			// Check if the target or any parent is within an item
			if (target.closest("[data-item-id]") || target.closest("[data-svg-item-id]")) {
				return;
			}
			// Also check if the active element (focused element) is within an item
			const activeElement = document.activeElement;
			if (
				activeElement &&
				(activeElement.closest("[data-item-id]") ||
					activeElement.closest("[data-svg-item-id]"))
			) {
				return;
			}
			// Check if this is a focus-related event by examining if the target is the SVG itself
			// but there's a recently focused element within an item
			if (target.tagName === "svg" && activeElement) {
				const focusedItemContainer =
					activeElement.closest("[data-item-id]") ||
					activeElement.closest("[data-svg-item-id]");
				if (focusedItemContainer) {
					return;
				}
			}
		}
		const until = svg.dataset?.suppressClearUntil
			? parseInt(svg.dataset.suppressClearUntil)
			: 0;
		if (until && Date.now() < until) {
			delete svg.dataset.suppressClearUntil;
			return;
		}
		presence.itemSelection?.clearSelection();
	};

	// Begin panning on empty background (mouse right-button OR single-finger touch when not in ink/eraser mode)
	const beginPanIfBackground = (e: React.MouseEvent | React.PointerEvent) => {
		const isPointer = (ev: unknown): ev is React.PointerEvent =>
			typeof ev === "object" &&
			ev !== null &&
			"pointerType" in (ev as Record<string, unknown>);
		const touchPrimary =
			isPointer(e) &&
			e.pointerType === "touch" &&
			(e as unknown as { isPrimary?: boolean }).isPrimary !== false;
		if (("button" in e && e.button === 2) || touchPrimary) {
			if (document.documentElement.dataset.manipulating) return;
			const tgt = e.target as Element | null;
			// Don't start panning if interacting with explicit handles
			if (tgt?.closest("[data-rotate-handle]") || tgt?.closest("[data-resize-handle]"))
				return;
			if (presence.drag.state.local || presence.resize.state?.local) return;
			if (tgt?.closest("[data-svg-item-id]")) return;
			if (tgt?.closest("[data-item-id]")) return;

			e.preventDefault();
			setIsPanning(true);
			lastPos.current = { x: e.clientX, y: e.clientY };
			movedRef.current = false;
		}
	};

	// Allow panning via empty HTML background inside foreignObject (same logic as above)
	const handleHtmlBackgroundMouseDown = (e: React.MouseEvent | React.PointerEvent) => {
		const isPointer = (ev: unknown): ev is React.PointerEvent =>
			typeof ev === "object" &&
			ev !== null &&
			"pointerType" in (ev as Record<string, unknown>);
		const touchPrimary =
			isPointer(e) &&
			e.pointerType === "touch" &&
			(e as unknown as { isPrimary?: boolean }).isPrimary !== false;
		if (("button" in e && e.button === 2) || touchPrimary) {
			if (document.documentElement.dataset.manipulating) return;
			const tgt = e.target as HTMLElement | null;
			// Skip when touching explicit manipulation handles
			if (tgt?.closest("[data-rotate-handle]") || tgt?.closest("[data-resize-handle]"))
				return;
			if (presence.drag.state.local || presence.resize.state?.local) return;
			if (tgt?.closest("[data-item-id]")) return;
			e.preventDefault();
			setIsPanning(true);
			lastPos.current = { x: e.clientX, y: e.clientY };
			movedRef.current = false;
		}
	};

	// Global move/up for panning (pointer events to support touch + mouse)
	useEffect(() => {
		if (!isPanning) return;
		const onMove = (ev: PointerEvent) => {
			if (!lastPos.current) return;
			const dx = ev.clientX - lastPos.current.x;
			const dy = ev.clientY - lastPos.current.y;
			if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
				setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
				lastPos.current = { x: ev.clientX, y: ev.clientY };
				movedRef.current = true;
			}
		};
		const onUp = () => {
			setIsPanning(false);
			lastPos.current = null;
			const rootEl = document.documentElement as HTMLElement & { dataset: DOMStringMap };
			if (rootEl.dataset) delete rootEl.dataset.panning;
			if (movedRef.current) {
				const svg = svgRef.current as (SVGSVGElement & { dataset: DOMStringMap }) | null;
				if (svg) svg.dataset.suppressClearUntil = String(Date.now() + 150);
			}
		};
		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onUp);
		document.addEventListener("pointercancel", onUp);
		return () => {
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onUp);
			document.removeEventListener("pointercancel", onUp);
		};
	}, [isPanning]);

	// Reflect panning state globally so other components can react
	useEffect(() => {
		if (isPanning) {
			const rootEl = document.documentElement as HTMLElement & { dataset: DOMStringMap };
			rootEl.dataset.panning = "1";
			return () => {
				if (rootEl.dataset) delete rootEl.dataset.panning;
			};
		}
	}, [isPanning]);

	// Pinch zoom gesture listeners (attached to svg element)
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (e.pointerType !== "touch") return;

			// Skip if touching an item - let the item handle its own dragging
			const target = e.target as Element | null;
			if (target?.closest("[data-item-id]") || target?.closest("[data-svg-item-id]")) return;

			activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
			if (activeTouches.current.size === 2) {
				// Initialize pinch
				const pts = Array.from(activeTouches.current.values());
				const dx = pts[1].x - pts[0].x;
				const dy = pts[1].y - pts[0].y;
				const dist = Math.hypot(dx, dy) || 1;
				const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
				pinchState.current = {
					initialDistance: dist,
					initialCenter: center,
					initialZoom: zoom,
					initialPan: { ...pan },
					lastAppliedZoom: zoom,
				};
			}
		};
		const handlePointerMove = (e: PointerEvent) => {
			if (e.pointerType !== "touch") return;
			if (!activeTouches.current.has(e.pointerId)) return;

			// Skip if touching an item - let the item handle its own dragging
			const target = e.target as Element | null;
			if (target?.closest("[data-item-id]") || target?.closest("[data-svg-item-id]")) return;

			activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
			if (pinchState.current && activeTouches.current.size === 2) {
				const pts = Array.from(activeTouches.current.values());
				const dx = pts[1].x - pts[0].x;
				const dy = pts[1].y - pts[0].y;
				const dist = Math.hypot(dx, dy) || 1;
				const scale = dist / pinchState.current.initialDistance;
				const newZoomRaw = pinchState.current.initialZoom * scale;
				const newZoom = clampZoom(newZoomRaw);
				// Apply a small hysteresis to reduce jitter (only apply if >=1% change from last applied)
				if (
					Math.abs(newZoom - pinchState.current.lastAppliedZoom) <
					pinchState.current.lastAppliedZoom * 0.01
				)
					return;
				// rAF batch apply (avoid layout thrash). Store to pinchState before scheduling.
				pinchState.current.lastAppliedZoom = newZoom;
				requestAnimationFrame(() => {
					// Recompute center in case layout scrolled (minimal risk)
					const rect = svg.getBoundingClientRect();
					const center = {
						x: pinchState.current!.initialCenter.x - rect.left,
						y: pinchState.current!.initialCenter.y - rect.top,
					};
					const p = {
						x:
							(center.x - pinchState.current!.initialPan.x) /
							pinchState.current!.initialZoom,
						y:
							(center.y - pinchState.current!.initialPan.y) /
							pinchState.current!.initialZoom,
					};
					const newPan = { x: center.x - newZoom * p.x, y: center.y - newZoom * p.y };
					setPan(newPan);
					if (onZoomChange) onZoomChange(newZoom);
					else setInternalZoom(newZoom);
				});
			}
		};
		const endPointer = (e: PointerEvent) => {
			if (e.pointerType !== "touch") return;
			activeTouches.current.delete(e.pointerId);
			if (activeTouches.current.size < 2) {
				pinchState.current = null;
			}
		};
		svg.addEventListener("pointerdown", handlePointerDown);
		svg.addEventListener("pointermove", handlePointerMove);
		svg.addEventListener("pointerup", endPointer);
		svg.addEventListener("pointercancel", endPointer);
		svg.addEventListener("pointerleave", endPointer);
		return () => {
			svg.removeEventListener("pointerdown", handlePointerDown);
			svg.removeEventListener("pointermove", handlePointerMove);
			svg.removeEventListener("pointerup", endPointer);
			svg.removeEventListener("pointercancel", endPointer);
			svg.removeEventListener("pointerleave", endPointer);
		};
	}, [svgRef.current, zoom, pan, onZoomChange]);

	return {
		canvasPosition,
		pan,
		zoom,
		isPanning,
		beginPanIfBackground,
		handleHtmlBackgroundMouseDown,
		handleBackgroundClick,
	};
}
