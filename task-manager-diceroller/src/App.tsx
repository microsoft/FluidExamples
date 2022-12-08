/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import "./App.css";
import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { ContainerSchema, IFluidContainer, ISharedMap, SharedMap } from "fluid-framework";
import { ITaskManager, TaskManager } from "@fluid-experimental/task-manager";

const client = new TinyliciousClient();

const diceKey = "dice-key";
const diceRollTaskId = "diceRollTaskId";

const containerSchema: ContainerSchema = {
	initialObjects: {
		sharedMap: SharedMap,
		taskManager: TaskManager,
	},
};

const getInitialObjects = async () => {
	let container: IFluidContainer;
	const containerId = window.location.hash.substring(1);
	if (!containerId) {
		({ container } = await client.createContainer(containerSchema));
		const id = await container.attach();
		window.location.hash = id;
	} else {
		({ container } = await client.getContainer(containerId, containerSchema));
	}
	return {
		sharedMap: container.initialObjects.sharedMap as ISharedMap,
		taskManager: container.initialObjects.taskManager as ITaskManager,
	};
};

function App() {
	const [sharedMap, setSharedMap] = React.useState<ISharedMap>();
	const [taskManager, setTaskManager] = React.useState<ITaskManager>();
	const [diceValue, setDiceValue] = React.useState<number>();
	const [assigned, setAssigned] = React.useState<boolean>(false);
	const [queued, setQueued] = React.useState<boolean>(false);
	const [subscribed, setSubscribed] = React.useState<boolean>(false);

	React.useEffect(() => {
		getInitialObjects().then((initialObjects) => {
			setSharedMap(initialObjects.sharedMap);
			setTaskManager(initialObjects.taskManager);
		});
	}, []);

	React.useEffect(() => {
		if (sharedMap !== undefined && taskManager !== undefined) {
			// Update dice value from SharedMap
			const syncView = () => setDiceValue(sharedMap.get(diceKey) ?? 1);
			syncView();
			sharedMap.on("valueChanged", syncView);

			// TaskManager Setup
			let rollInterval: NodeJS.Timeout | undefined;

			const rollDice = () => {
				const roll = Math.floor(Math.random() * 6) + 1;
				sharedMap.set(diceKey, roll);
				console.log(`New dice roll: ${roll}`);
			};

			const updateState = () => {
				setAssigned(taskManager.assigned(diceRollTaskId));
				setQueued(taskManager.queued(diceRollTaskId));
				setSubscribed(taskManager.subscribed(diceRollTaskId));
			};

			const startRollingDice = (taskId: string) => {
				if (taskId !== diceRollTaskId) {
					// We should check that that we were assigned the dice roll task
					return;
				}
				// Once we are assigned the task we can start rolling the dice.
				rollDice();
				rollInterval = setInterval(rollDice, 1500);

				updateState();
			};

			const stopRollingDice = (taskId: string) => {
				if (taskId !== diceRollTaskId) {
					// We should check that that we lost the dice roll task
					return;
				}
				// If we lose the task assignment we should stop rolling the dice.
				clearInterval(rollInterval);
				rollInterval = undefined;

				updateState();
			};

			taskManager.on("assigned", startRollingDice);
			taskManager.on("lost", stopRollingDice);
			taskManager.on("completed", stopRollingDice);

			// Once our listeners are setup we can subscribe to the task
			taskManager.subscribeToTask(diceRollTaskId);

			// Turn off listeners when component is unmounted
			return () => {
				sharedMap.off("valueChanged", syncView);
				taskManager.off("assigned", startRollingDice);
				taskManager.off("lost", stopRollingDice);
				if (rollInterval !== undefined) {
					clearInterval(rollInterval);
				}
			};
		}
	}, [sharedMap, taskManager]);

	if (!taskManager || !diceValue) return <div />;

	const abandon = () => taskManager.abandon(diceRollTaskId);
	const volunteer = () => taskManager.volunteerForTask(diceRollTaskId);
	const subscribe = () => taskManager.subscribeToTask(diceRollTaskId);
	const complete = () => taskManager.complete(diceRollTaskId);

	return (
		<div>
			{/* Dice Roller */}
			<div style={{ textAlign: "center", fontSize: 20 }}>
				<div style={{ fontSize: 300, color: `hsl(${diceValue * 60}, 70%, 50%)` }}>
					{String.fromCodePoint(0x267f + diceValue)}
				</div>
				<div>
					{assigned
						? "This Client is currently: Task Assignee"
						: "This Client is currently: Not Task Assignee"}
				</div>
			</div>

			{/* Debug Info */}
			<div>
				<strong>Debug Info</strong>
				<div>Queued: {taskManager.queued(diceRollTaskId).toString()}</div>
				<div>Assigned: {taskManager.assigned(diceRollTaskId).toString()}</div>
				<div>Subscribed: {taskManager.subscribed(diceRollTaskId).toString()}</div>

				<div className="buttons">
					<button disabled={!queued} onClick={abandon} className="click">
						Abandon
					</button>
					<button disabled={queued} onClick={volunteer} className="click">
						Volunteer
					</button>
					<button disabled={queued && subscribed} onClick={subscribe} className="click">
						Subscribe
					</button>
					<button disabled={!assigned} onClick={complete} className="click">
						Complete
					</button>
				</div>
			</div>
		</div>
	);
}

export default App;
