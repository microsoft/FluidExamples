/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedMap } from "fluid-framework";
import { TinyliciousClient } from '@fluidframework/tinylicious-client';

interface TimestampDataModel { time: string | undefined; }
interface FluidDataModel { sharedTimestamp: SharedMap };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  fluidSharedObjects: FluidDataModel | undefined;
  localTimestamp: TimestampDataModel | undefined;
  sharedTimestamp: FluidDataModel['sharedTimestamp'] | undefined;
  updateLocalTimestamp: ((...args: any[]) => void) | undefined;

  async ngOnInit() {
    this.fluidSharedObjects = await this.getFluidData();
    this.syncData();
  }

  async getFluidData() {
    // TODO 1: Configure the container.
    const client = new TinyliciousClient();
    const containerSchema = {
      initialObjects: { sharedTimestamp: SharedMap }
    };

    // TODO 2: Get the container from the Fluid service.
    let container;
    const containerId = location.hash.substring(1);
    if (!containerId) {
      ({ container } = await client.createContainer(containerSchema));
      const id = await container.attach();
      location.hash = id;
    }
    else {
      ({ container } = await client.getContainer(containerId, containerSchema));
    }

    // TODO 3: Return the Fluid timestamp object.
    return container.initialObjects as any as FluidDataModel;
  }

  syncData() {
    // Only sync if the Fluid SharedMap object is defined.
    if (this.fluidSharedObjects) {
      // TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
      this.sharedTimestamp = this.fluidSharedObjects.sharedTimestamp;
      this.updateLocalTimestamp = () => { this.localTimestamp = { time: this.sharedTimestamp!.get("time") } };
      this.updateLocalTimestamp();

      // TODO 5: Register handlers.
      this.sharedTimestamp!.on("valueChanged", this.updateLocalTimestamp!);
    }
  }

  onButtonClick() {
    this.fluidSharedObjects?.sharedTimestamp.set("time", Date.now().toString());
  }

  ngOnDestroy() {
    // TODO 6: Delete handler registration when the Angular App component is dismounted.
    this.sharedTimestamp!.off("valueChanged", this.updateLocalTimestamp!);
  }

}
