import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiceRoller } from './services/diceroller.dataobject';
import { FluidLoaderService } from './services/fluid-loader.service';
import { DiceRollerContainerRuntimeFactory } from "./services/containerCode";

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>Dice Roller Fluid Demo</h1>
    This demonstration shows how to use Fluid distributed data structures to sync data across multiple clients.
    After starting the demo (see the readme for instructions), copy the browser's URL into another tab to create another Fluid client. 
    <br /><br />
    After multiple clients are available, click the Roll button to sync rolls across all of the clients.
    <br />
    <div style="text-align: center">
      <div style="font-size: 200px;" [ngStyle]="{color: diceCharColor }">
        {{diceChar}}
      </div>
      <button style="font-size: 50px" (click)="dataObject.roll()">Roll</button>
    </div>
  </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  diceChar: string;
  diceCharColor: string;
  dataObject: DiceRoller;
  sub: Subscription;

  constructor(private fluidService: FluidLoaderService, 
              private changeDetector: ChangeDetectorRef) {}

  async ngOnInit() {
    this.dataObject = await this.fluidService.loadDataObject<DiceRoller>(DiceRollerContainerRuntimeFactory);
    this.sub = this.dataObject.diceRolled$.subscribe(this.updateDiceChar);
  }

  updateDiceChar = (val: number) => {
    // Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
    this.diceChar = String.fromCodePoint(0x267F + val);
    this.diceCharColor = `hsl(${val * 60}, 70%, 50%)`;
    // diceRolled event is occuring outside of Angular so detecting changes
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
