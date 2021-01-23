import { Component, Input, OnInit } from '@angular/core';
import { INoteWithVotes, IUser } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-note',
  template: `
    <button *ngIf="note && note.user && user" class="note"
      [ngClass]="{ others: note.user.id != user.id && highlightMine }">
        <span *ngIf="count > 0" class="note-badge" [class.voted]="note.currentUserVoted">
          {{ count }}
        </span>
      <span class="note-text">{{ note.text }}</span>
    </button>  
  `
})
export class NoteComponent implements OnInit {

  @Input() note: INoteWithVotes;
  @Input() highlightMine: boolean;
  @Input() user: IUser;
  @Input() count: number;

  constructor() { }

  ngOnInit() { }

}
