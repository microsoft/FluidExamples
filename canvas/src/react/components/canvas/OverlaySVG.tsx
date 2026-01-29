import React from "react";
import { Items, Item } from "../../../schema/appSchema.js";
import { SelectionOverlay } from "../../overlays/SelectionOverlay.js";
import { PresenceOverlay } from "../../overlays/PresenceOverlay.js";
import { CommentOverlay } from "../../overlays/CommentOverlay.js";

export function OverlaySVG(props: {
	items: Items;
	canvasPosition: { left: number; top: number };
	pan: { x: number; y: number };
	zoom: number;
	layout: Map<string, { left: number; top: number; right: number; bottom: number }>;
	presence: React.ContextType<typeof import("../../contexts/PresenceContext.js").PresenceContext>;
	selKey: string;
	motionKey: string;
	layoutVersion: number;
	commentPaneVisible: boolean;
	getInitials: (id: string) => string;
	getUserColor: (id: string) => string;
	expandedPresence: Set<string>;
	setExpandedPresence: React.Dispatch<React.SetStateAction<Set<string>>>;
}): JSX.Element {
	const {
		items,
		pan,
		zoom,
		layout,
		presence,
		selKey,
		motionKey,
		layoutVersion,
		commentPaneVisible,
		getInitials,
		getUserColor,
		expandedPresence,
		setExpandedPresence,
	} = props;

	return (
		<svg
			className="overlay-svg absolute inset-0 pointer-events-none"
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 1000,
				pointerEvents: "none",
				touchAction: "none",
			}}
		>
			{/* Selection overlays */}
			<g
				key={`sel-${selKey}-${motionKey}-${layoutVersion}`}
				transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
				style={{ pointerEvents: "auto", touchAction: "none" }}
			>
				{items.map((item) => {
					if (!(item instanceof Item)) return null;
					const isSelected = presence.itemSelection?.testSelection({ id: item.id });
					if (!isSelected) return null;
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

			{/* Presence overlays */}
			<g
				key={`presence-${selKey}-${motionKey}-${layoutVersion}`}
				transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
				style={{ pointerEvents: "auto", touchAction: "none" }}
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

			{/* Comment overlays */}
			<g
				key={`comments-${selKey}-${motionKey}-${layoutVersion}`}
				transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
				style={{ pointerEvents: "auto", touchAction: "none" }}
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
		</svg>
	);
}
