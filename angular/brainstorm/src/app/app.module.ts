import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NoteroComponent } from './notero/notero.component';
import { PadComponent } from './pad/pad.component';
import { BoardComponent } from './board/board.component';
import { NoteComponent } from './board/note.component';
import { UsernameComponent } from './pad/username.component';

@NgModule({
  declarations: [
    AppComponent,
    NoteroComponent,
    PadComponent,
    BoardComponent,
    NoteComponent,
    UsernameComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
