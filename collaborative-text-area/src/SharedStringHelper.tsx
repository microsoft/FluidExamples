/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IEvent } from "@fluidframework/common-definitions";
import { TypedEventEmitter } from "@fluidframework/common-utils";
// import { MergeTreeDeltaType } from "@fluidframework/merge-tree";  Removed until enum access issue is resolved (https://github.com/microsoft/FluidFramework/issues/8142)
import { SequenceDeltaEvent, SharedString } from "@fluidframework/sequence";

export interface ISharedStringHelperTextChangedEventArgs {
  /**
   * Whether the change originated from the local client.
   */
  isLocal: boolean;

  /**
   * A callback function for this particular change that translates pre-change positions in the sequence into
   * post-change positions.  For example, to track where a user's caret should move to after a remote change
   * in order for it to remain in the same portion of the text.
   */
  transformPosition: (oldPosition: number) => number;
}

export interface ISharedStringHelperEvents extends IEvent {
  (event: "textChanged", listener: (event: ISharedStringHelperTextChangedEventArgs) => void): void;
}

/**
 * Given a SharedString will provide a friendly API for use.
 */
export class SharedStringHelper extends TypedEventEmitter<ISharedStringHelperEvents> {
  private readonly _sharedString: SharedString;
  private _latestText: string;
  constructor(sharedString: SharedString) {
    super();
    this._sharedString = sharedString;
    this._latestText = this._sharedString.getText();
    this._sharedString.on("sequenceDelta", this.sequenceDeltaHandler);
  }

  /**
   * @returns The full text stored in the SharedString as a string.
   */
  public getText(): string {
    return this._latestText;
  }

  /**
   * Insert the string provided at the given position.
   */
  public insertText(text: string, pos: number): void {
    this._sharedString.insertText(pos, text);
  }

  /**
   * Remove the text within the given range.
   */
  public removeText(start: number, end: number): void {
    this._sharedString.removeText(start, end);
  }

  /**
   * Insert the string provided at the given start position, and remove the text that (prior to the insertion) is
   * within the given range.  Equivalent to doing the two operations sequentially.
   * Consider removing?
   */
  public replaceText(text: string, start: number, end: number): void {
    this._sharedString.replaceText(start, end, text);
  }

  /**
   * Called when the data of the SharedString changes.  We update our cached text and emit the "textChanged" event.
   * Most of the work is to build up the appropriate transformPosition function, which allows the caller to translate
   * pre-update positions to post-update positions (e.g. to find where a caret should move to).
   */
  sequenceDeltaHandler = (event: SequenceDeltaEvent) => {
    // const previousText = this._latestText;
    this._latestText = this._sharedString.getText();
    const isLocal = event.isLocal;

    const op = event.opArgs.op;
    let transformPosition: (oldPosition: number) => number;

    // Here we use `0` to represent an INSERT operation.
    // Replace with `MergeTreeDeltaType.INSERT` when enum access issue is resolved.
    // https://github.com/microsoft/FluidFramework/issues/8142
    if (op.type === 0) {
      transformPosition = (oldPosition: number) => {
        if (op.pos1 === undefined) {
          throw new Error("pos1 undefined");
        }
        if (op.seg === undefined) {
          throw new Error("seg undefined");
        }
        const changeStartPosition = op.pos1;
        const changeLength = (op.seg).length;
        let newPosition;
        if (oldPosition <= changeStartPosition) {
          // Position is unmoved by the insertion if it is before the insertion's start
          newPosition = oldPosition;
        } else {
          // Position is moved by the length of the insertion if it is after the insertion's start
          newPosition = oldPosition + changeLength;
        }
        // eslint-disable-next-line max-len
        // console.log(`previousText: ${previousText} newText: ${this._latestText} ChangeRange: ${changeStartPosition}-${changeStartPosition + changeLength}, Transform: ${oldPosition} -> ${newPosition}`);
        // console.log(op);
        return newPosition;
      };
    }
    // Here we use `1` to represent a REMOVE operation.
    // Replace with `MergeTreeDeltaType.REMOVE` when enum access issue is resolved.
    // https://github.com/microsoft/FluidFramework/issues/8142
    else if (op.type === 1) {
      transformPosition = (oldPosition: number) => {
        if (op.pos1 === undefined) {
          throw new Error("pos1 undefined");
        }
        if (op.pos2 === undefined) {
          throw new Error("pos2 undefined");
        }
        const changeStartPosition = op.pos1;
        const changeEndPosition = op.pos2;
        const changeLength = changeEndPosition - changeStartPosition;
        let newPosition;
        if (oldPosition <= changeStartPosition) {
          // Position is unmoved by the deletion if it is before the deletion's start
          newPosition = oldPosition;
        } else if (oldPosition > (changeEndPosition - 1)) {
          // Position is moved by the size of the deletion if it is after the deletion's end
          newPosition = oldPosition - changeLength;
        } else {
          // Position snaps to the left side of the deletion if it is inside the deletion.
          newPosition = changeStartPosition;
        }
        return newPosition;
      };
    }
    else {
      throw new Error("Don't know how to handle op types beyond insert and remove");
    }

    this.emit("textChanged", { isLocal, transformPosition });
  };
}
