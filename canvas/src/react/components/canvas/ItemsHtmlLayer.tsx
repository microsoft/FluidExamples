import React from "react";
import { Items, Item } from "../../../schema/appSchema.js";
import { ItemView } from "../items/ItemView.js";

export function ItemsHtmlLayer(props: {
	items: Items;
	canvasPosition: { left: number; top: number };
	pan: { x: number; y: number };
	zoom: number;
}): JSX.Element {
	const { items, canvasPosition, pan, zoom } = props;
	return (
		<div
			className="items-html-layer relative h-full w-full"
			style={{
				left: `${pan.x}px`,
				top: `${pan.y}px`,
				transform: `scale(${zoom})`,
				transformOrigin: "0 0",
			}}
		>
			{items.map((item, index) =>
				item instanceof Item ? (
					<ItemView
						item={item}
						key={item.id}
						index={index}
						canvasPosition={{ left: canvasPosition.left, top: canvasPosition.top }}
						hideSelectionControls
						pan={pan}
						zoom={zoom}
					/>
				) : (
					<></>
				)
			)}
		</div>
	);
}
