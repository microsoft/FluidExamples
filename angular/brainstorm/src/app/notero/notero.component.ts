import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notero } from '../services/notero.dataobject';
import { INote, IUser } from '../shared/interfaces';

@Component({
  selector: 'app-notero',
  template: `
    <div *ngIf="model">
      <app-pad
        [model]="model"
        [user]="user"
        [users]="users"
        [highlightMine]="highlightMine"
        (onHighlightMine)="onHighlightMine($event)"></app-pad>
      <app-board
        [model]="model"
        [notes]="notes"
        [user]="user"
        [highlightMine]="highlightMine"></app-board>
    </div>
  `
})
export class NoteroComponent implements OnInit, OnDestroy {

  @Input() model: Notero;
  highlightMine: boolean;
  user: IUser;
  users: IUser[];
  notes: INote[];
  changeSub: Subscription;

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit()  { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.changeSub && changes.model && changes.model.currentValue) {
      this.model = changes.model.currentValue;
      this.changed();
      this.changeSub = this.model.change$.subscribe((change: any) => this.changed(change));
    }
  }

  changed(change?: any) {
    // Not using change here but could use it to provide more granular changes if needed
    this.notes = this.model.getNotesFromBoard();
    this.user = this.model.getUser();
    this.users = this.model.getUsers();

    // Event is occuring outside of Angular so detecting changes
    this.changeDetector.detectChanges();
  }

  onHighlightMine(highlightMine: boolean) {
    this.highlightMine = highlightMine;
  }

  ngOnDestroy() {
    this.changeSub.unsubscribe();
  }

}
