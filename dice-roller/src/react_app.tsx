/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { ReactNode, useEffect, useState } from "react";
import { TreeView, Tree } from "fluid-framework";
import { DiceRoller } from "./schema.js";

export function ReactApp(props: { data: TreeView<typeof DiceRoller> }): JSX.Element {
	const [invalidations, setInvalidations] = useState(0);

	const diceRoller = props.data.root;

	// Register for tree deltas when the component mounts.
	// Any time the tree changes, the app will update.
	useEffect(() => {
		const unsubscribe = Tree.on(diceRoller, "treeChanged", () => {
			setInvalidations(invalidations + Math.random());
		});
		return unsubscribe;
	}, []);

	return (
		<div className="flex flex-row gap-3 justify-center flex-wrap w-full h-full">
			<div className="flex flex-col gap-3 justify-center content-center m-4">
				<VisualDie diceRoller={diceRoller} />
				<RollButton diceRoller={diceRoller} />
			</div>
		</div>
	);
}

export function VisualDie(props: { diceRoller: DiceRoller }): JSX.Element {
	const divStyle = {
		// color: `hsl(${parseInt(props.diceRoller.value, 10) * 60}, 70%, 50%)`,
		color: `hsl(${props.diceRoller.value * 60}, 70%, 50%)`,
		fontSize: "200px",
	};

	// Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
	return (
		<div style={divStyle}>
			{String.fromCodePoint((0x267f + props.diceRoller.value) as unknown as number)}
		</div>
	);
}

export function RollButton(props: { diceRoller: DiceRoller }): JSX.Element {
	return (
		<button
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
			onClick={() => props.diceRoller.roll()}
		>
			Roll
		</button>
	);
}
