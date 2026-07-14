/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import { TreeView, Tree } from "fluid-framework";
import { App, Shape } from "../../../schema/appSchema.js";
import { undoRedo } from "../../../undo/undo.js";
import { isShape, isTable } from "../../../utils/contentHandlers.js";
import { findItemsByIds } from "../../../utils/itemsHelpers.js";
import { TypedSelection } from "../../../presence/selection.js";
import {
	NewCircleButton,
	NewSquareButton,
	NewTriangleButton,
	NewStarButton,
	NewNoteButton,
	NewTableButton,
} from "./buttons/CreationButtons.js";
import { VoteButton, DeleteButton, DuplicateButton, CommentButton } from "./buttons/EditButtons.js";
import { ShapeColorPicker } from "./buttons/ShapeButtons.js";
import {
	AddColumnButton,
	AddRowButton,
	MoveColumnLeftButton,
	MoveColumnRightButton,
	MoveRowUpButton,
	MoveRowDownButton,
} from "./buttons/SimpleTableButtons.js";
import {
	MoveItemForwardButton,
	MoveItemBackwardButton,
	BringItemToFrontButton,
	SendItemToBackButton,
} from "./buttons/ZOrderButtons.js";
import { InkColorPicker, InkToggleButton, EraserToggleButton } from "./buttons/InkButtons.js";
import { UndoButton, RedoButton, ClearAllButton } from "./buttons/ActionButtons.js";
import { CommentsPaneToggleButton } from "./buttons/PaneButtons.js";
import { ZoomMenu } from "./buttons/ViewButtons.js";
import { DeleteSelectedRowsButton } from "./buttons/TableButtons.js";
// All toolbar button UIs now componentized; direct TooltipButton usage removed.
import { MessageBar, MessageBarBody, MessageBarTitle } from "@fluentui/react-message-bar";
import { Toolbar, ToolbarDivider, ToolbarGroup } from "@fluentui/react-toolbar";
import type { SelectionManager } from "../../../presence/Interfaces/SelectionManager.js";

export interface AppToolbarProps {
	view: TreeView<typeof App>;
	tree: TreeView<typeof App>;
	canvasSize: { width: number; height: number };
	pan?: { x: number; y: number };
	selectedItemId: string;
	selectedItemIds: string[];
	selectedColumnId: string;
	selectedRowId: string;
	commentPaneHidden: boolean;
	setCommentPaneHidden: (hidden: boolean) => void;
	undoRedo: undoRedo;
	canUndo: boolean;
	canRedo: boolean;
	tableSelection: SelectionManager<TypedSelection>;
	zoom?: number;
	onZoomChange?: (z: number) => void;
	inkActive: boolean;
	onToggleInk: () => void;
	eraserActive: boolean;
	onToggleEraser: () => void;
	inkColor: string;
	onInkColorChange: (c: string) => void;
	inkWidth: number;
	onInkWidthChange: (w: number) => void;
	shapeColor: string;
	onShapeColorChange: (c: string) => void;
}

export function AppToolbar(props: AppToolbarProps): JSX.Element {
	const {
		view,
		tree,
		canvasSize,
		pan,
		selectedItemId,
		selectedItemIds,
		selectedColumnId,
		selectedRowId,
		commentPaneHidden,
		setCommentPaneHidden,
		undoRedo,
		canUndo,
		canRedo,
		tableSelection,
		zoom,
		onZoomChange,
		inkActive,
		onToggleInk,
		eraserActive,
		onToggleEraser,
		inkColor,
		onInkColorChange,
		inkWidth,
		onInkWidthChange,
		shapeColor,
		onShapeColorChange,
	} = props;

	// Zoom slider logic moved into ZoomMenu component.

	return (
		<Toolbar className="app-toolbar h-[48px] shadow-lg flex-nowrap overflow-x-auto overflow-y-hidden whitespace-nowrap min-h-[48px] max-h-[48px]">
			{/* Undo / Redo group (leftmost) */}
			<ToolbarGroup>
				<UndoButton onUndo={() => undoRedo.undo()} disabled={!canUndo} />
				<RedoButton onRedo={() => undoRedo.redo()} disabled={!canRedo} />
			</ToolbarGroup>
			<ToolbarDivider />
			{/* Inking / Eraser group */}
			<ToolbarGroup>
				<InkToggleButton
					inkActive={inkActive}
					eraserActive={eraserActive}
					onToggleInk={onToggleInk}
					onToggleEraser={onToggleEraser}
				/>
				<EraserToggleButton
					inkActive={inkActive}
					eraserActive={eraserActive}
					onToggleInk={onToggleInk}
					onToggleEraser={onToggleEraser}
				/>
				<InkColorPicker
					setColor={(c: string) => onInkColorChange(c)}
					selected={inkColor}
					ariaLabel="Ink color picker"
					inkWidth={inkWidth}
					onInkWidthChange={onInkWidthChange}
				/>
			</ToolbarGroup>
			<ToolbarDivider />
			{/* Shape creation buttons */}
			<ToolbarGroup>
				<NewCircleButton
					items={view.root.items}
					canvasSize={canvasSize}
					pan={pan}
					zoom={zoom}
					shapeColor={shapeColor}
				/>
				<NewSquareButton
					items={view.root.items}
					canvasSize={canvasSize}
					pan={pan}
					zoom={zoom}
					shapeColor={shapeColor}
				/>
				<NewTriangleButton
					items={view.root.items}
					canvasSize={canvasSize}
					pan={pan}
					zoom={zoom}
					shapeColor={shapeColor}
				/>
				<NewStarButton
					items={view.root.items}
					canvasSize={canvasSize}
					pan={pan}
					zoom={zoom}
					shapeColor={shapeColor}
				/>
				{(() => {
					// Get selected items and filter for shapes
					const selectedItems = findItemsByIds(view.root.items, selectedItemIds);
					const selectedShapes = selectedItems
						.filter((item) => isShape(item))
						.map((item) => item.content as Shape);

					return (
						<ShapeColorPicker
							color={shapeColor}
							onColorChange={onShapeColorChange}
							selectedShapes={selectedShapes}
						/>
					);
				})()}
			</ToolbarGroup>
			<ToolbarDivider />
			{/* Note and Table creation buttons */}
			<ToolbarGroup>
				<NewNoteButton
					items={view.root.items}
					canvasSize={canvasSize}
					pan={pan}
					zoom={zoom}
				/>
				<NewTableButton
					items={view.root.items}
					canvasSize={canvasSize}
					pan={pan}
					zoom={zoom}
				/>
			</ToolbarGroup>
			{(() => {
				const selectedItems = findItemsByIds(view.root.items, selectedItemIds);
				const hasSelectedItems = selectedItems.length > 0;
				const singleSelectedItem = selectedItems.length === 1 ? selectedItems[0] : null;

				// Only show divider and buttons when items are selected
				if (!hasSelectedItems) {
					return null;
				}

				return (
					<>
						<div className="flex items-center h-full toolbar-slide-in bg-blue-100 border-l-2 border-blue-500 pl-4 pr-4 ml-4">
							{/* Selection context using Fluent design principles */}
							<div className="px-1 py-1 text-xs font-semibold text-blue-700 rounded mr-1">
								{selectedItems.length === 1
									? "Selected"
									: `${selectedItems.length} Selected`}
							</div>
							<ToolbarGroup>
								{/* Single-item actions: only show when exactly one item is selected */}
								{singleSelectedItem && (
									<>
										<VoteButton vote={singleSelectedItem.votes} />
										<CommentButton item={singleSelectedItem} />
									</>
								)}
								{/* Multi-item actions: show when any items are selected */}
								{hasSelectedItems && (
									<>
										<DuplicateButton
											count={selectedItems.length}
											duplicate={() => {
												Tree.runTransaction(view.root.items, () => {
													selectedItems.forEach((item) => {
														if (item) {
															view.root.items.duplicateItem(
																item,
																canvasSize
															);
														}
													});
												});
											}}
										/>
										<DeleteButton
											delete={() => {
												Tree.runTransaction(view.root.items, () => {
													selectedItems.forEach((item) => item?.delete());
												});
											}}
											count={selectedItems.length}
										/>
									</>
								)}
							</ToolbarGroup>
							<ToolbarDivider />
							<ToolbarGroup>
								<SendItemToBackButton
									items={view.root.items}
									selectedItemId={selectedItemId}
								/>
								<MoveItemBackwardButton
									items={view.root.items}
									selectedItemId={selectedItemId}
								/>
								<MoveItemForwardButton
									items={view.root.items}
									selectedItemId={selectedItemId}
								/>
								<BringItemToFrontButton
									items={view.root.items}
									selectedItemId={selectedItemId}
								/>
							</ToolbarGroup>
						</div>
						{singleSelectedItem && isTable(singleSelectedItem) && (
							<div className="flex items-center h-full toolbar-slide-in-delayed bg-green-100 border-l-2 border-green-500 pl-4 pr-4 ml-4">
								{/* Table-specific controls with distinct visual styling */}
								<div className="px-1 py-1 text-xs font-semibold text-green-700 rounded mr-1">
									Table
								</div>
								<ToolbarGroup>
									<AddColumnButton table={singleSelectedItem.content} />
									<AddRowButton table={singleSelectedItem.content} />
									<DeleteSelectedRowsButton
										table={singleSelectedItem.content}
										selection={tableSelection}
									/>
									<MoveColumnLeftButton
										table={singleSelectedItem.content}
										selectedColumnId={selectedColumnId}
									/>
									<MoveColumnRightButton
										table={singleSelectedItem.content}
										selectedColumnId={selectedColumnId}
									/>
									<MoveRowUpButton
										table={singleSelectedItem.content}
										selectedRowId={selectedRowId}
									/>
									<MoveRowDownButton
										table={singleSelectedItem.content}
										selectedRowId={selectedRowId}
									/>
								</ToolbarGroup>
							</div>
						)}
					</>
				);
			})()}
			<ToolbarDivider />
			<ToolbarGroup>
				<ClearAllButton
					onClear={() => {
						Tree.runTransaction(view.root, () => {
							if (view.root.items.length > 0) view.root.items.removeRange();
							if (view.root.inks.length > 0) view.root.inks.removeRange();
						});
					}}
					disabled={view.root.items.length === 0 && view.root.inks.length === 0}
				/>
			</ToolbarGroup>
			<ToolbarDivider />
			<ToolbarGroup>
				<CommentsPaneToggleButton
					paneHidden={commentPaneHidden}
					onToggle={(h) => setCommentPaneHidden(h)}
				/>
			</ToolbarGroup>
			{/* Right side grouping (auto) */}
			<ToolbarGroup style={{ marginLeft: "auto" }}>
				{view !== tree && (
					<div className="mr-4">
						<MessageBarComponent message="While viewing an AI Task, others will not see your changes (and you will not see theirs) until you complete the task." />
					</div>
				)}
				<ZoomMenu zoom={zoom} onZoomChange={onZoomChange} />
			</ToolbarGroup>
		</Toolbar>
	);
}

function MessageBarComponent(props: { message: string }): JSX.Element {
	const { message } = props;
	return (
		<MessageBar>
			<MessageBarBody>
				<MessageBarTitle>{message}</MessageBarTitle>
			</MessageBarBody>
		</MessageBar>
	);
}
