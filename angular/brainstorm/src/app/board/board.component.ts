import { Component, Input, OnInit } from '@angular/core';
import { Notero } from '../services/notero.dataobject';
import { INote, INoteWithVotes, IUser } from '../shared/interfaces';

@Component({
  selector: 'app-board',
  template: `
    <div class="board">
      <div *ngFor="let note of notes">
        <app-note
          [note]="note"
          [count]="note.votes"
          [user]="user"
          [highlightMine]="highlightMine"
          (click)="vote(note)"></app-note>
    </div>
  `
})
export class BoardComponent implements OnInit {

  @Input() model: Notero;
  @Input() notes: INoteWithVotes[];
  @Input() user: IUser;
  @Input() highlightMine: any;

  constructor() { }

  ngOnInit() { }

  vote(note: INote) {
    this.model.vote(note);
  }

}
