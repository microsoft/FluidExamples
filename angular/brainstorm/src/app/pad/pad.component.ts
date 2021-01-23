import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Notero } from '../services/notero.dataobject';
import { IUser } from '../shared/interfaces';

@Component({
  selector: 'app-pad',
  template: `
    <div class="container">
      <div class="pad">
        <div class="note editor">
          <textarea class="note-text"
            (keydown)="onKeyDown($event)"
            (focus)="onNoteFocus($event)"
            [value]="value"
          ></textarea>
        </div>
        <button class="button" [disabled]="disabled" (click)="createNote()">Share my idea</button>
        <button class="button" [disabled]="disabled" (click)="handleHighlight()">
          {{ highlightMine ? "Stop highlighting" : "Highlight my ideas" }}
        </button>
      <app-username *ngIf="user && users" [user]="user" [userCount]="users.length"></app-username>
      </div>
    </div>
  `
})
export class PadComponent implements OnInit {
  
  @Input() model: Notero;
  @Input() user: IUser;
  @Input() users: IUser[];
  @Input() highlightMine: boolean;
  @Output() onHighlightMine = new EventEmitter<boolean>();
  value = '';
  disabled = false;

  constructor() { }

  ngOnInit() { }

  createNote() {
    this.model.createNote(this.value);
    this.value = '';
  }

  onNoteFocus(e: any) {
    if (!this.value.length) {
      this.value = this.model.createDemoNote();
    }
  }

  onKeyDown (e: any) {
    // Handle enter
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      this.model.createNote(this.value);
      this.value = '';
      e.target.blur();
    }
    else {
      this.value = e.target.value;
    }
  }

  handleHighlight() {
    this.highlightMine = !this.highlightMine;
    this.onHighlightMine.emit(this.highlightMine);
  }

}
