import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CollaborativeTextAreaComponent } from './collaborative-text-area/collaborative-text-area.component';

@NgModule({
  declarations: [
    AppComponent,
    CollaborativeTextAreaComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
