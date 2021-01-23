import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SharedString } from '@fluidframework/sequence';

@Component({
  selector: 'app-collaborative-text-area',
  template: `
    <h1>Collaborative Text Area</h1>
    <!-- There are a lot of different ways content can be inserted into a textarea
         and not all of them trigger a onBeforeInput event. To ensure we are grabbing
         the correct selection before we modify the shared string we need to make sure
         this.updateSelection is being called for multiple cases. -->
    <textarea #textArea
        rows="20"
        cols="50"
        class=""
        style=""
        (beforeinput)="updateSelection()"
        (keydown)="updateSelection()"
        (click)="updateSelection()"
        (contextmenu)="updateSelection()"
        (input)="handleChange($event)"
        [value]="text"></textarea>
  `
})
export class CollaborativeTextAreaComponent implements OnInit, AfterViewInit {

  @Input() sharedString: SharedString;
  @ViewChild('textArea') textArea: ElementRef;
  text: string;
  selectionEnd = 0;
  selectionStart = 0;

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit() { 
    this.text = this.sharedString.getText();
  }

  ngAfterViewInit() {
    // Sets an event listener so we can update our state as the value changes
    this.sharedString.on("sequenceDelta", (event: any) => {
      const newText = this.sharedString.getText();
      // We only need to insert if the text changed.
      if (newText === this.text) {
        return;
      }

      // If the event is our own then just insert the text
      if (event.isLocal) {
        this.text = newText;
        return;
      }

      // Because we did not make the change we need to manage the remote
      // character insertion.
      const remoteCaretStart = event.first.position;
      const remoteCaretEnd = event.last.position + event.last.segment.cachedLength;
      const charactersModifiedCount = newText.length - this.text.length;

      this.updateSelection();
      const currentCaretStart = this.selectionStart;
      const currentCaretEnd = this.selectionEnd;

      let newCaretStart = 0;
      let newCaretEnd = 0;

      // Remote text inserted/removed after our cp range
      if (currentCaretEnd <= remoteCaretStart) {
        // cp stays where it was before.
        newCaretStart = currentCaretStart;
        newCaretEnd = currentCaretEnd;
      } else if (currentCaretStart > (remoteCaretEnd - 1)) {
        // Remote text inserted/removed before our cp range
        // We need to move our cp the number of characters inserted/removed
        // to ensure we are in the same position
        newCaretStart = currentCaretStart + charactersModifiedCount;
        newCaretEnd = currentCaretEnd + charactersModifiedCount;
      } else {
        // Remote text is overlapping cp

        // The remote changes occurred inside current selection
        if (remoteCaretEnd <= currentCaretEnd && remoteCaretStart > currentCaretStart) {
          // Our selection needs to include remote changes
          newCaretStart = currentCaretStart;
          newCaretEnd = currentCaretEnd + charactersModifiedCount;
        } else if (remoteCaretEnd >= currentCaretEnd && remoteCaretStart <= currentCaretStart) {
          // The remote changes encompass our location

          // Our selection has been removed
          // Move our cp to the beginning of the new text insertion
          newCaretStart = remoteCaretStart;
          newCaretEnd = remoteCaretStart;
        } else {
          // We have partial overlapping selection with the changes.
          // This makes things a lot harder to manage so for now we will just remove the current selection
          // and place it to the remote caret start.
          newCaretStart = remoteCaretStart;
          newCaretEnd = remoteCaretStart;
        }
      }

      this.text = newText;
      this.setCaretPosition(newCaretStart, newCaretEnd);
      // The event we're listening for here fires outside of Angular
      // so let it know to detect changes
      this.changeDetector.detectChanges();
    });
  }

  setCaretPosition(newStart: number, newEnd: number) {
    if (this.textArea) {
        const textArea = this.textArea.nativeElement;
        textArea.selectionStart = newStart;
        textArea.selectionEnd = newEnd;
    }
  }

  updateSelection() {
    if (!this.textArea) {
      return;
    }

    const textArea = this.textArea.nativeElement;
    this.selectionStart = textArea.selectionStart ? textArea.selectionStart : 0;
    this.selectionEnd = textArea.selectionEnd ? textArea.selectionEnd : 0;
  }

  handleChange(event: any) {
    // We need to set the value here to keep the input responsive to the user
    const currentTarget = event.currentTarget;
    const newText = currentTarget.value;
    const charactersModifiedCount = this.text.length - newText.length;
    this.text = newText;

    // Get the new caret position and use that to get the text that was inserted
    const newPosition = currentTarget.selectionStart ? currentTarget.selectionStart : 0;
    const isTextInserted = newPosition - this.selectionStart > 0;
    if (isTextInserted) {
        const insertedText = newText.substring(this.selectionStart, newPosition);
        const changeRangeLength = this.selectionEnd - this.selectionStart;
        if (changeRangeLength === 0) {
            this.sharedString.insertText(this.selectionStart, insertedText);
        } else {
            this.sharedString.replaceText(this.selectionStart, this.selectionEnd, insertedText);
        }
    } else {
        // Text was removed
        this.sharedString.removeText(newPosition, newPosition + charactersModifiedCount);
    }
  }

}
