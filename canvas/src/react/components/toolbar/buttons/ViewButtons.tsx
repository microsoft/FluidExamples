/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX } from "react";
import { Badge } from "@fluentui/react-components";
import { Menu, MenuTrigger, MenuPopover, MenuList } from "@fluentui/react-components";

// Selection count badge
export function SelectionCountBadge(props: { count: number }): JSX.Element {
	const { count } = props;
	if (count <= 1) return <></>;
	return (
		<div className="flex items-center px-2">
			<Badge appearance="filled" color="brand" size="small">
				{count} selected
			</Badge>
		</div>
	);
}

// Zoom Menu
export function ZoomMenu(props: {
	zoom?: number;
	onZoomChange?: (z: number) => void;
}): JSX.Element {
	const { zoom, onZoomChange } = props;
	const formatZoom = (z: number | undefined) => `${Math.round((z ?? 1) * 100)}%`;
	const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = parseInt(e.target.value, 10);
		onZoomChange?.(val / 100);
	};
	return (
		<Menu>
			<MenuTrigger>
				<button
					className="px-2 py-1 rounded bg-black/70 text-white hover:bg-black transition-colors text-sm border border-white/20 inline-flex items-center justify-center"
					style={{ width: 72 }}
					aria-label="Zoom"
				>
					<span className="tabular-nums font-medium">{formatZoom(zoom)}</span>
					<span className="ml-1 text-[10px]">▼</span>
				</button>
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<div
						className="px-3 py-2 w-56 select-none"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between text-xs mb-2">
							<span className="font-semibold">Zoom</span>
							<button
								onClick={() => onZoomChange?.(1)}
								className="text-blue-500 hover:underline"
							>
								Reset
							</button>
						</div>
						<input
							type="range"
							min={25}
							max={400}
							step={5}
							value={Math.round((zoom ?? 1) * 100)}
							onChange={handleSlider}
							className="w-full"
						/>
					</div>
				</MenuList>
			</MenuPopover>
		</Menu>
	);
}
