import { Component, OnInit } from '@angular/core';
import { CollaborativeText } from './services/collaborative-text.dataobject';
import { FluidLoaderService } from './services/fluid-loader.service';
import { CollaborativeTextContainerRuntimeFactory } from "./services/containerCode";

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>Collaborative TextArea Fluid Demo</h1>
    This demonstration shows how to use Fluid distributed data structures to sync data across multiple clients.
    After starting the demo (see the readme for instructions), copy the browser's URL into another tab to create another Fluid client. 
    <br /><br />
    After multiple clients are available, type into the text area and notice that all changes are synced across clients.
    <br />
    <div class="text-area" *ngIf="dataObject">
      <app-collaborative-text-area [sharedString]="dataObject.text"></app-collaborative-text-area>
    </div>
  </div>
  `
})
export class AppComponent implements OnInit {
  dataObject: CollaborativeText;

  constructor(private fluidService: FluidLoaderService) {}

  async ngOnInit() {
    this.dataObject = await this.fluidService.loadDataObject<CollaborativeText>(CollaborativeTextContainerRuntimeFactory);
  }

}
