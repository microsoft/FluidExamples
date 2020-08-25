/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { FC } from "react";
import { INote, INoteWithVotes, IUser } from "../fluid-object/interfaces";
import { Note } from "./Note";

interface BoardProps {
  notes: INoteWithVotes[];
  vote: (note: INote) => void;
  user: IUser;
  highlightMine: boolean;
}

export const Board: FC<BoardProps> = (props) => (
  <div className="board">
    {props.notes.map((note) => (
      <Note
        key={note.id}
        note={note}
        onClick={() => props.vote(note)}
        count={note.votes}
        user={props.user}
        highlightMine={props.highlightMine}
      />
    ))}
  </div>
);
