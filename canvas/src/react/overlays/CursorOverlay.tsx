/**
 * Cursor Overlay Component
 *
 * Renders collaborative cursor overlays showing real-time mouse positions
 * of remote users when they hover over the canvas. Each cursor displays:
 * - A pointer icon indicating mouse position
 * - A user badge with their name/initials and color
 * - Smooth animation as cursors move
 *
 * Key Features:
 * - Fixed size regardless of canvas zoom level
 * - Automatic positioning relative to canvas coordinates
 * - User identification with colors and badges
 * - Smooth cursor movement animations
 * - Automatic cleanup of stale cursors
 */

import React, { useEffect, useState } from "react";
import { CursorManager, CursorState } from "../../presence/Interfaces/CursorManager.js";

export function CursorOverlay(props: {
	cursorManager: CursorManager;
	canvasPosition: { left: number; top: number };
	pan: { x: number; y: number };
	zoom: number;
	getInitials: (id: string) => string;
	getUserColor: (id: string) => string;
	presence: React.ContextType<typeof import("../contexts/PresenceContext.js").PresenceContext>;
}): JSX.Element {
	const { cursorManager, canvasPosition, pan, zoom, getInitials, getUserColor, presence } = props;
	const [remoteCursors, setRemoteCursors] = useState<
		Array<{ state: CursorState; clientId: string }>
	>([]);

	// Subscribe to cursor state changes and update remote cursors
	useEffect(() => {
		const updateCursors = () => {
			setRemoteCursors(cursorManager.getVisibleRemoteCursors());
		};

		// Initial update
		updateCursors();

		// Subscribe to changes
		const unsubscribe = cursorManager.events.on("remoteUpdated", updateCursors);

		return unsubscribe;
	}, [cursorManager]);

	return (
		<>
			{remoteCursors.map(({ state, clientId }) => {
				// Convert logical coordinates to screen coordinates
				// state.x/y are in logical space, need to apply zoom then pan, then canvas offset
				const screenX = canvasPosition.left + state.x * zoom + pan.x;
				const screenY = canvasPosition.top + state.y * zoom + pan.y;

				// Get the actual user information from connected users
				const connected = (presence.users.getConnectedUsers?.() ??
					[]) as unknown as ReadonlyArray<{
					value: { name: string; id: string; image?: string };
					client: { attendeeId: string };
				}>;
				const user = connected.find((u) => u.client.attendeeId === clientId);

				const userColor = getUserColor(clientId);
				const userInitials = user ? getInitials(user.value.name) : getInitials(clientId);

				// Badge sizing constants (matching PresenceOverlay)
				const badgeRadius = 12; // px
				const badgeStroke = 2; // px
				const badgeFont = 10; // px

				return (
					<div
						key={clientId}
						className="fixed pointer-events-none z-[1001]"
						style={{
							left: screenX,
							top: screenY,
							transform: "translate(-2px, -2px)", // Offset cursor tip to point position
							transition: "left 0.1s ease-out, top 0.1s ease-out", // Smooth movement
						}}
					>
						{/* Cursor pointer */}
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							className="drop-shadow-md relative z-10"
						>
							{/* Cursor arrow with border */}

							{/* Colored tip */}
							<path d="M5 3L19 12L12 14L8 19L5 3Z" fill={userColor} strokeWidth="0" />
						</svg>

						{/* User badge - circular like selection badges */}
						<div
							className="absolute top-4 left-2 z-20"
							style={{
								width: badgeRadius * 2,
								height: badgeRadius * 2,
								borderRadius: "50%",
								backgroundColor: userColor,
								border: `${badgeStroke}px solid white`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: `${badgeFont}px`,
								fontWeight: 600,
								color: "white",
								boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
							}}
						>
							{userInitials}
						</div>
					</div>
				);
			})}
		</>
	);
}
