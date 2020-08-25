/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { FC } from "react";
import { INoteWithVotes, IUser } from "../fluid-object/interfaces";

interface NoteProps extends React.AllHTMLAttributes<HTMLButtonElement> {
  count: number;
  note: INoteWithVotes;
  user: IUser;
  highlightMine: boolean;
}

export const Note: FC<NoteProps> = (props) => (
  <button
    className={
      props.note.user.id != props.user.id && props.highlightMine
        ? "note others"
        : "note"
    }
    onClick={props.onClick}
  >
    {props.count > 0 && (
      <span
        className={`note-badge ${props.note.currentUserVoted ? "voted" : ""}`}
      >
        {props.count}
      </span>
    )}
    <span className="note-text">{props.note.text}</span>
  </button>
);
