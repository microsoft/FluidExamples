/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Items } from "../schema/app_schema.js";
import { Session } from "../schema/session_schema.js";
import "../output.css";
import { IFluidContainer, IMember, IServiceAudience, TreeView } from "fluid-framework";
import { undefinedUserId } from "../utils/utils.js";
import { Canvas } from "./canvasux.js";
import { undoRedo } from "../utils/undo.js";

export function ReactApp(props: {
	items: TreeView<typeof Items>;
	sessionTree: TreeView<typeof Session>;
	audience: IServiceAudience<IMember>;
	container: IFluidContainer;
	undoRedo: undoRedo;
}): JSX.Element {
	const [currentUser, setCurrentUser] = useState(undefinedUserId);
	const [connectionState, setConnectionState] = useState("");
	const [saved, setSaved] = useState(false);
	const [fluidMembers, setFluidMembers] = useState<string[]>([]);

	/** Unsubscribe to undo-redo events when the component unmounts */
	useEffect(() => {
		return props.undoRedo.dispose;
	}, []);

	return (
		<div
			id="main"
			className="flex flex-col bg-transparent h-screen w-full overflow-hidden overscroll-none"
		>
			<Header
				saved={saved}
				connectionState={connectionState}
				fluidMembers={fluidMembers}
				clientId={currentUser}
			/>
			<div className="flex h-[calc(100vh-48px)] flex-row ">
				<Canvas
					items={props.items}
					sessionTree={props.sessionTree}
					audience={props.audience}
					container={props.container}
					fluidMembers={fluidMembers}
					currentUser={currentUser}
					undoRedo={props.undoRedo}
					setCurrentUser={setCurrentUser}
					setConnectionState={setConnectionState}
					setSaved={setSaved}
					setFluidMembers={setFluidMembers}
				/>
			</div>
		</div>
	);
}

export function Header(props: {
	saved: boolean;
	connectionState: string;
	fluidMembers: string[];
	clientId: string;
}): JSX.Element {
	return (
		<div className="h-[48px] flex shrink-0 flex-row items-center justify-between bg-black text-base text-white z-40 w-full">
			<div className="flex m-2">Brainstorm</div>
			<div className="flex m-2 ">
				{props.saved ? "saved" : "not saved"} | {props.connectionState} | users:{" "}
				{props.fluidMembers.length}
			</div>
		</div>
	);
}
