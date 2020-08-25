/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useContext, useState, useEffect, FC } from "react";
import { INoteWithVotes, IUser } from "../fluid-object/interfaces";
import { FluidContext } from "../utils";
import { Board } from "./Board";
import { Pad } from "./Pad";

// NoteroView
interface NoteroViewState {
  user: IUser;
  users: IUser[];
  notes: INoteWithVotes[];
}

export const NoteroView: FC = () => {
  const model = useContext(FluidContext);
  const generateState = () => {
    return {
      user: model.getUser(),
      users: model.getUsers(),
      notes: model.getNotesFromBoard(),
    };
  };
  const [state, setState] = useState<NoteroViewState>(generateState());
  const [highlightMine, setHighlightMine] = useState<boolean>();

  // Setup a listener that
  useEffect(() => {
    const onChange = () => setState(generateState());
    model.on("change", onChange);

    // useEffect runs after the first render so we will update the view again incase there
    // were changes that came into the model in between generating initialState and setting
    // the above event handler
    onChange();
    return () => {
      // When the view dismounts remove the listener to avoid memory leaks
      model.off("change", onChange);
    };
  }, []);

  return (
    <div>
      <Pad
        createNote={model.createNote}
        demo={model.createDemoNote}
        user={state.user}
        users={state.users}
        clear={() => alert("clear not implemented")}
        setHighlightMine={setHighlightMine}
        highlightMine={highlightMine}
      />
      <Board
        notes={state.notes}
        vote={model.vote}
        user={state.user}
        highlightMine={highlightMine}
      />
    </div>
  );
};
