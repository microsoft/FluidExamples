/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, ReactNode, useEffect, useState } from "react";
import { TreeView, Tree } from "fluid-framework";
import { StringArray } from "./schema.js";

export function ReactApp(props: { data: TreeView<typeof StringArray> }): JSX.Element {
	return (
		<div className="flex flex-col gap-3 items-center justify-center content-center m-6">
			<div className="flex flex-row gap-3 justify-center flex-wrap w-full h-full">
				<ListGroup list={props.data.root} />
			</div>
			<Explanation />
		</div>
	);
}

export function ListGroup(props: { list: StringArray }): JSX.Element {
	const [count, setCount] = useState(props.list.length);

	// Register for change events on the list when the component mounts.
	// Any time the list changes, the app will update
	useEffect(() => {
		const unsubscribe = Tree.on(props.list, "nodeChanged", () => {
			setCount(props.list.length);
		});
		return unsubscribe;
	}, []);

	return (
		<div className="flex flex-col gap-3 justify-center content-center m-6">
			<div className="flex flex-row gap-3 justify-center content-center ">
				<ItemCount count={count} />
			</div>
			<div className="flex flex-row gap-3 justify-center content-center ">
				<InsertButton insert={props.list.insertNew} />
				<RemoveButton remove={props.list.removeFirst} />
			</div>
		</div>
	);
}

export function ItemCount(props: { count: number }): JSX.Element {
	// Show the count of items in the list
	return (
		<div className="flex flex-col justify-center bg-black w-24 h-24 rounded-full shadow-md">
			<div
				className="text-center text-4xl font-extrabold bg-transparent text-white"
				aria-label="Item count"
			>
				{props.count}
			</div>
		</div>
	);
}

export function InsertButton(props: { insert: () => void }): JSX.Element {
	const handleClick = () => {
		// Add an item to the beginning of the list
		props.insert();
	};

	return <Button handleClick={handleClick}>Insert</Button>;
}

export function RemoveButton(props: { remove: () => void }): JSX.Element {
	const handleClick = () => {
		// Remove an item from the list
		props.remove();
	};

	return <Button handleClick={handleClick}>Remove</Button>;
}

export function Button(props: { children: ReactNode; handleClick: () => void }): JSX.Element {
	return (
		<button
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-24"
			onClick={() => props.handleClick()}
		>
			{props.children}
		</button>
	);
}

export function Explanation(): JSX.Element {
	return (
		<div className="flex flex-col max-w-sm gap-4 justify-left my-8">
			<BlackBox>
				Copy the full URL to another browser tab or send it to someone to see that the data
				is synched between clients.
			</BlackBox>
			<div className="text-base">
				This is a simple demonstration of Fluid Framework. The circle shows the number of
				items in a distributed array.
			</div>
			<div className="text-base">
				Clicking the insert and remove buttons inserts or removes an item from the array.
			</div>
			<div className="text-base">
				In this case, the items in the array are just empty strings, but they could be
				complex objects, maps, or other arrays.
			</div>
		</div>
	);
}

export function BlackBox(props: { children: ReactNode }): JSX.Element {
	return (
		<div className="text-xl bg-black text-white p-4 rounded shadow-md">{props.children}</div>
	);
}

export function DemoLink(props: { href: string; children: ReactNode }): JSX.Element {
	return (
		<div className="text-xl pt-2 text-blue-300 hover:text-white hover:underline">
			<a href={props.href}>{props.children}</a>
		</div>
	);
}
