import { Component, OnInit } from '@angular/core';
import { Notero } from './services/notero.dataobject';
import { FluidLoaderService } from './services/fluid-loader.service';
import { NoteroContainerFactory } from './services/containerCode';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>Brainstorm Fluid Demo</h1>
    This demonstration shows how to use Fluid distributed data structures to sync data across multiple clients.
    After starting the demo (see the readme for instructions), copy the browser's URL into another tab to create another Fluid client. 
    <br /><br />
    To get started click on the yellow sticky note and press the "Share my idea" button. To vote for a note, click on it. All notes and votes
    will be synced across connected clients.
    <br />
    <app-notero [model]="dataObject"></app-notero>
  </div>
  `
})
export class AppComponent implements OnInit {

  dataObject: Notero;

  constructor(private fluidService: FluidLoaderService) {}

  async ngOnInit() {
    this.dataObject = await this.fluidService.loadDataObject<Notero>(NoteroContainerFactory);
  }

}
