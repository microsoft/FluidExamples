import * as React from "react";
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Button } from "@fluentui/react-northstar";
import { SharedMap } from "fluid-framework";
import { diceValueKey } from "./Util";
import { useState, useEffect } from "react";

export type FluidContentProps = Readonly<{
	fluidMap: SharedMap;
}>;

export const FluidContent = (props: FluidContentProps) => {
	const generateState = (): { color: string; content: string } => {
		const diceValue = props.fluidMap.get(diceValueKey);
		// Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
		return {
			content: String.fromCodePoint(0x267f + diceValue),
			color: `hsl(${diceValue * 60}, 70%, 30%)`,
		};
	};
	const [diceView, setDiceView] = useState<{ color: string; content: string } | undefined>(
		generateState(),
	);

	useEffect(() => {
		// sync Fluid data into view state
		const updateDice = () => {
			setDiceView(generateState());
		};
		// Use the changed event to trigger the rerender whenever the value changes.
		props.fluidMap.on("valueChanged", updateDice);

		// turn off listener when component is unmounted
		return () => {
			props.fluidMap.off("valueChanged", updateDice);
		};
	});

	// Set the value at our diceValueKey with a random number between 1 and 6.
	const onClick = () => {
		props.fluidMap.set(diceValueKey, Math.floor(Math.random() * 6) + 1);
	};

	return (
		<div>
			<h2>Hello World!</h2>
			<div className="wrapper" style={{ alignItems: "center" }}>
				<div className="dice" style={{ color: diceView!.color, fontSize: "200px" }}>
					{diceView!.content}
				</div>
				<Button className="roll" style={{ fontSize: "50px" }} onClick={onClick}>
					{" "}
					Roll{" "}
				</Button>
			</div>
		</div>
	);
};
