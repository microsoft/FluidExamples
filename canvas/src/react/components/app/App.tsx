/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useState, useRef } from "react";
import { App } from "../../../schema/appSchema.js";
import "../../../output.css";
import "../../../styles/ios-minimal.css";
// import "../../../styles/ios-fixes.css";
// import "../../../styles/ios-safari-fixes.css";
// import { fixIOSZIndexIssues } from "../../../utils/iosZIndexFix.js";
import { ConnectionState, IFluidContainer, TreeView } from "fluid-framework";
import { Canvas } from "../canvas/Canvas.js";
import type { SelectionManager } from "../../../presence/Interfaces/SelectionManager.js";
import { undoRedo } from "../../../undo/undo.js";
import { useSelectionSync, useMultiTypeSelectionSync } from "../../../utils/eventSubscriptions.js";
import { DragAndRotatePackage } from "../../../presence/drag.js";
import { TypedSelection } from "../../../presence/selection.js";
import {
	Avatar,
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarGroupProps,
	partitionAvatarGroupItems,
} from "@fluentui/react-avatar";
import { Text } from "@fluentui/react-text";
import { ToolbarDivider } from "@fluentui/react-toolbar";
import { Tooltip } from "@fluentui/react-tooltip";
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from "@fluentui/react-menu";
import { SignOut20Regular, PersonSwap20Regular } from "@fluentui/react-icons";
import { User, UsersManager } from "../../../presence/Interfaces/UsersManager.js";
import { PresenceContext } from "../../contexts/PresenceContext.js";
import { AuthContext } from "../../contexts/AuthContext.js";
import { signOutHelper, switchAccountHelper } from "../../../infra/auth.js";
import { DragManager } from "../../../presence/Interfaces/DragManager.js";
import { ResizeManager } from "../../../presence/Interfaces/ResizeManager.js";
import { ResizePackage } from "../../../presence/Interfaces/ResizeManager.js";
import { CursorManager } from "../../../presence/Interfaces/CursorManager.js";
import { CommentPane, CommentPaneRef } from "../panels/CommentPane.js";
import { useTree } from "../../hooks/useTree.js";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";
import { useAppKeyboardShortcuts } from "../../hooks/useAppKeyboardShortcuts.js";
import { PaneContext } from "../../contexts/PaneContext.js";
import { AppToolbar } from "../toolbar/AppToolbar.js";
import { InkPresenceManager } from "../../../presence/Interfaces/InkManager.js";
// Removed circle ink creation; ink tool toggles freehand drawing.

// Context for comment pane actions
export const CommentPaneContext = React.createContext<{
	openCommentPaneAndFocus: (itemId: string) => void;
} | null>(null);

export function ReactApp(props: {
	tree: TreeView<typeof App>;
	itemSelection: SelectionManager<TypedSelection>;
	tableSelection: SelectionManager<TypedSelection>;
	users: UsersManager;
	container: IFluidContainer;
	undoRedo: undoRedo;
	drag: DragManager<DragAndRotatePackage | null>;
	resize: ResizeManager<ResizePackage | null>;
	cursor: CursorManager;
	ink?: InkPresenceManager;
}): JSX.Element {
	const {
		tree,
		itemSelection,
		tableSelection,
		users,
		container,
		undoRedo,
		drag,
		resize,
		cursor,
		ink,
	} = props;
	const [connectionState, setConnectionState] = useState("");
	const [saved, setSaved] = useState(false);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [commentPaneHidden, setCommentPaneHidden] = useState(true);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	// Start with ink mode enabled by default so users can draw immediately.
	const [inkActive, setInkActive] = useState(true);
	const [eraserActive, setEraserActive] = useState(false);
	const [inkColor, setInkColor] = useState<string>("#2563eb");
	const [inkWidth, setInkWidth] = useState<number>(4);
	const [shapeColor, setShapeColor] = useState<string>("#FF0000"); // Default to red

	// Keep linter satisfied until pan is surfaced elsewhere
	useEffect(() => {
		void pan;
	}, [pan]);
	const [selectedItemId, setSelectedItemId] = useState<string>("");
	const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
	const [selectedColumnId, setSelectedColumnId] = useState<string>("");
	const [selectedRowId, setSelectedRowId] = useState<string>("");
	const [view] = useState<TreeView<typeof App>>(tree);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const commentPaneRef = useRef<CommentPaneRef>(null);

	// Function to open comment pane and focus input
	const openCommentPaneAndFocus = (itemId: string) => {
		setSelectedItemId(itemId);
		setCommentPaneHidden(false);
		// Use setTimeout to ensure the pane is rendered before focusing
		setTimeout(() => {
			commentPaneRef.current?.focusInput();
		}, 0);
	};

	useTree(tree.root);
	useTree(view.root.items);
	useTree(view.root.comments);
	// Subscribe to ink strokes so toolbar actions inserting ink trigger re-render
	useTree(view.root.inks);

	useEffect(() => {
		const updateConnectionState = () => {
			if (container.connectionState === ConnectionState.Connected) {
				setConnectionState("connected");
			} else if (container.connectionState === ConnectionState.Disconnected) {
				setConnectionState("disconnected");
			} else if (container.connectionState === ConnectionState.EstablishingConnection) {
				setConnectionState("connecting");
			} else if (container.connectionState === ConnectionState.CatchingUp) {
				setConnectionState("catching up");
			}
		};
		updateConnectionState();
		setSaved(!container.isDirty);
		container.on("connected", updateConnectionState);
		container.on("disconnected", updateConnectionState);
		container.on("dirty", () => setSaved(false));
		container.on("saved", () => setSaved(true));
		container.on("disposed", updateConnectionState);
	}, [container]);

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		// Update undo/redo state whenever commits occur
		const updateUndoRedoState = () => {
			setCanUndo(undoRedo.canUndo());
			setCanRedo(undoRedo.canRedo());
		};

		// Initial update
		updateUndoRedoState();

		// Listen for commits to update undo/redo state
		const unsubscribe = tree.events.on("commitApplied", updateUndoRedoState);

		// Cleanup function
		return () => {
			unsubscribe();
			undoRedo.dispose();
		};
	}, [tree.events, undoRedo]);

	useEffect(() => {
		// View changed
	}, [view]);

	// Initialize iOS Safari z-index fixes
	useEffect(() => {
		// Temporarily disabled to debug toolbar visibility
		// fixIOSZIndexIssues();
	}, []);

	// Use unified selection sync for item selection state management
	useSelectionSync(
		itemSelection,
		(selections) => {
			const selectedIds = selections.map((sel) => sel.id);
			// Update both states for backwards compatibility
			setSelectedItemIds(selectedIds);
			setSelectedItemId(selectedIds.length > 0 ? selectedIds[0] : "");
		},
		[view]
	);

	// Use multi-type selection sync for table selection state management
	useMultiTypeSelectionSync(tableSelection, {
		column: (selections) => setSelectedColumnId(selections[0]?.id ?? ""),
		row: (selections) => setSelectedRowId(selections[0]?.id ?? ""),
	});

	// Keyboard shortcuts
	const shortcuts = useAppKeyboardShortcuts({
		view,
		canvasSize,
		pan,
		zoom,
		shapeColor,
		selectedItemId,
		selectedItemIds,
		selectedColumnId,
		selectedRowId,
		commentPaneHidden,
		undoRedo,
		users,
		canUndo,
		canRedo,
		setCommentPaneHidden,
		openCommentPaneAndFocus,
		selectionManager: itemSelection,
	});

	useKeyboardShortcuts({
		shortcuts,
	});

	return (
		<PresenceContext.Provider
			value={{
				users: users,
				itemSelection: itemSelection,
				tableSelection: tableSelection,
				drag: drag,
				resize: resize,
				cursor: cursor,
				branch: view !== tree,
				ink: ink,
			}}
		>
			<CommentPaneContext.Provider value={{ openCommentPaneAndFocus }}>
				<div
					id="main"
					className="flex flex-col bg-transparent h-screen w-full overflow-hidden overscroll-none"
				>
					<Header saved={saved} connectionState={connectionState} />
					{/* <div style={{ position: "relative", zIndex: 9999, isolation: "isolate" }}> */}
					<AppToolbar
						view={view}
						tree={tree}
						canvasSize={canvasSize}
						selectedItemId={selectedItemId}
						selectedItemIds={selectedItemIds}
						selectedColumnId={selectedColumnId}
						selectedRowId={selectedRowId}
						commentPaneHidden={commentPaneHidden}
						setCommentPaneHidden={setCommentPaneHidden}
						undoRedo={undoRedo}
						canUndo={canUndo}
						canRedo={canRedo}
						tableSelection={tableSelection}
						zoom={zoom}
						onZoomChange={setZoom}
						pan={pan}
						inkActive={inkActive}
						onToggleInk={() => setInkActive((a) => !a)}
						eraserActive={eraserActive}
						onToggleEraser={() => setEraserActive((a) => !a)}
						inkColor={inkColor}
						onInkColorChange={setInkColor}
						inkWidth={inkWidth}
						onInkWidthChange={setInkWidth}
						shapeColor={shapeColor}
						onShapeColorChange={setShapeColor}
					/>
					{/* </div> */}
					<div className="canvas-container flex h-[calc(100vh-96px)] w-full flex-row ">
						<PaneContext.Provider
							value={{
								panes: [{ name: "comments", visible: !commentPaneHidden }],
							}}
						>
							<Canvas
								items={view.root.items}
								container={container}
								setSize={(width, height) => setCanvasSize({ width, height })}
								zoom={zoom}
								onZoomChange={setZoom}
								onPanChange={setPan}
								inkActive={inkActive}
								eraserActive={eraserActive}
								inkColor={inkColor}
								inkWidth={inkWidth}
							/>
						</PaneContext.Provider>
						<CommentPane
							ref={commentPaneRef}
							hidden={commentPaneHidden}
							setHidden={setCommentPaneHidden}
							itemId={selectedItemId}
							app={view.root}
						/>
					</div>
				</div>
			</CommentPaneContext.Provider>
		</PresenceContext.Provider>
	);
}

export function Header(props: { saved: boolean; connectionState: string }): JSX.Element {
	const { saved, connectionState } = props;

	return (
		<div className="h-[48px] flex shrink-0 flex-row items-center justify-between bg-black text-base text-white z-[9999] w-full text-nowrap">
			<div className="flex items-center">
				<div className="flex ml-2 mr-8">
					<Text weight="bold">Fluid Framework Demo</Text>
				</div>
			</div>
			<div className="flex flex-row items-center m-2">
				<SaveStatus saved={saved} />
				<HeaderDivider />
				<ConnectionStatus connectionState={connectionState} />
				<HeaderDivider />
				<UserCorner />
			</div>
		</div>
	);
}

export function SaveStatus(props: { saved: boolean }): JSX.Element {
	const { saved } = props;
	return (
		<div className="flex items-center">
			<Text>{saved ? "" : "not"}&nbsp;saved</Text>
		</div>
	);
}

export function ConnectionStatus(props: { connectionState: string }): JSX.Element {
	const { connectionState } = props;
	return (
		<div className="flex items-center">
			<Text>{connectionState}</Text>
		</div>
	);
}

export function UserCorner(): JSX.Element {
	return (
		<div className="flex flex-row items-center gap-4 mr-2">
			<Facepile />
			<CurrentUser />
		</div>
	);
}

export const HeaderDivider = (): JSX.Element => {
	return <ToolbarDivider />;
};

/**
 * CurrentUser component displays the current user's avatar with a context menu.
 * The context menu includes a sign-out option that uses MSAL to properly
 * log out the user and redirect them to the login page.
 */
export const CurrentUser = (): JSX.Element => {
	const users = useContext(PresenceContext).users;
	const currentUser = users.getMyself().value;
	const { msalInstance } = useContext(AuthContext);

	// Get the user's email from MSAL account
	const userEmail = msalInstance?.getActiveAccount()?.username || currentUser.name;

	const handleSignOut = async () => {
		if (msalInstance) {
			await signOutHelper(msalInstance);
		}
	};

	const handleSwitchAccount = async () => {
		if (msalInstance) {
			await switchAccountHelper(msalInstance);
		}
	};

	return (
		<Menu>
			<MenuTrigger disableButtonEnhancement>
				<Tooltip
					content={`${currentUser.name} (${userEmail}) - Click for options`}
					relationship="label"
				>
					<Avatar
						name={currentUser.name}
						image={currentUser.image ? { src: currentUser.image } : undefined}
						size={24}
						style={{ cursor: "pointer" }}
					/>
				</Tooltip>
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<MenuItem icon={<PersonSwap20Regular />} onClick={handleSwitchAccount}>
						Switch account
					</MenuItem>
					<MenuItem icon={<SignOut20Regular />} onClick={handleSignOut}>
						Sign out
					</MenuItem>
				</MenuList>
			</MenuPopover>
		</Menu>
	);
};

export const Facepile = (props: Partial<AvatarGroupProps>) => {
	const users = useContext(PresenceContext).users;
	const [userRoster, setUserRoster] = useState(users.getConnectedUsers());

	useEffect(() => {
		// Check for changes to the user roster and update the avatar group if necessary
		const unsubscribe = users.events.on("remoteUpdated", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		// Update the user roster when users disconnect
		const unsubscribe = users.attendees.events.on("attendeeDisconnected", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	const { inlineItems, overflowItems } = partitionAvatarGroupItems<User>({
		items: userRoster,
		maxInlineItems: 3, // Maximum number of inline avatars before showing overflow
	});

	if (inlineItems.length === 0) {
		return null; // No users to display
	}

	return (
		<AvatarGroup size={24} {...props}>
			{inlineItems.map((user) => (
				<Tooltip
					key={String(user.client.attendeeId ?? user.value.name)}
					content={user.value.name}
					relationship={"label"}
				>
					<AvatarGroupItem
						name={user.value.name}
						image={user.value.image ? { src: user.value.image } : undefined}
						key={String(user.client.attendeeId ?? user.value.name)}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((user) => (
						<AvatarGroupItem
							name={user.value.name}
							image={user.value.image ? { src: user.value.image } : undefined}
							key={String(user.client.attendeeId ?? user.value.name)}
						/>
					))}
				</AvatarGroupPopover>
			)}
		</AvatarGroup>
	);
};
