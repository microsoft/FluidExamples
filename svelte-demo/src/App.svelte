<script lang="ts">
  import { SharedMap } from "fluid-framework";
  import { TinyliciousClient } from "@fluidframework/tinylicious-client";
  import { onMount, onDestroy } from "svelte";

  interface TimestampDataModel {
    time: string | undefined;
  }

  let sharedTimestamp: SharedMap | undefined;
  let localTimestamp: TimestampDataModel | undefined;
  let updateLocalTimestamp: (() => void) | undefined;

  onMount(async () => {
    sharedTimestamp = await getFluidData();
    syncData();
  });

  onDestroy(() => {
    // Delete handler registration when the Svelte App component is dismounted.
    sharedTimestamp!.off("valueChanged", updateLocalTimestamp!);
  });

  const getFluidData = async () => {
    // TODO 1: Configure the container.
    const client = new TinyliciousClient();
    const containerSchema = {
      initialObjects: { sharedTimestamp: SharedMap },
    };

    // TODO 2: Get the container from the Fluid service.
    let container;
    const containerId = location.hash.substring(1);
    if (!containerId) {
      ({ container } = await client.createContainer(containerSchema));
      const id = await container.attach();
      location.hash = id;
    } else {
      ({ container } = await client.getContainer(containerId, containerSchema));
    }

    // TODO 3: Return the Fluid timestamp object.
    return container.initialObjects.sharedTimestamp as SharedMap;
  };

  const syncData = () => {
    // Only sync if the Fluid SharedMap object is defined.
    if (sharedTimestamp) {
      // TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
      updateLocalTimestamp = () => {
        localTimestamp = { time: sharedTimestamp!.get("time") };
      };
      updateLocalTimestamp();

      // TODO 5: Register handlers.
      sharedTimestamp!.on("valueChanged", updateLocalTimestamp!);
    }
  };
  const onButtonClick = () => {
    sharedTimestamp?.set("time", Date.now().toString());
  };
</script>

/*! * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
* Licensed under the MIT License. */

{#if localTimestamp}
  <div class="app">
    <button class="getTime" on:click={onButtonClick}>Get Time</button>
    <span class="time">{localTimestamp.time}</span>
  </div>
{/if}
