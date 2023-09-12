<script setup lang="ts">
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap, type ISharedMap } from "fluid-framework";
import { onMounted, ref } from "vue";

const timeKey = "time-key";

// TODO 1: Configure the container.
const client = new TinyliciousClient();
const containerSchema = {
	initialObjects: { myMap: SharedMap },
};

// TODO 2: Prepare top-level bindings.
let fluidMap: ISharedMap | undefined;
const time = ref<number | undefined>();
// TODO 3: Setup callback to update the fluid SharedMap.
const setTime = () => fluidMap?.set(timeKey, Date.now().toString());

onMounted(async () => {
	// TODO 3: Get the container from the Fluid service.
	let container;
	const containerId = location.hash.substring(1);
	if (!containerId) {
		({ container } = await client.createContainer(containerSchema));
		(container.initialObjects.myMap as ISharedMap).set(timeKey, Date.now().toString());
		const id = await container.attach();
		location.hash = id;
	} else {
		({ container } = await client.getContainer(containerId, containerSchema));
	}
	fluidMap = container.initialObjects.myMap as ISharedMap;

	// TODO 5: Setup callback to update the view.
	const syncView = () => (time.value = fluidMap!.get(timeKey));
	fluidMap.on("valueChanged", syncView);
	syncView();
});
</script>

<template>
	<!-- Only display content once time is defined -->
	<div class="app" v-if="time !== undefined">
		<button @click="setTime">Get Time</button>
		<span>{{ time }}</span>
	</div>
</template>

<style scoped>
.app {
	margin: 2em;
	text-align: center;
}
</style>
