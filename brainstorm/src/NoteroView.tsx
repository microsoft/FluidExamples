/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, FC } from "react";
import {
  IItem,
  INoteroDataModel,
  INoteWithVotes,
  IUser,
} from "./fluid-object/interfaces";
import { Board } from "./partials/Board";
import { List } from "./partials/List";
import { Pad } from "./partials/Pad";

// eslint-disable-next-line import/no-unassigned-import
import "./styles.scss";

// NoteroView
interface NoteroViewProps {
  readonly model: INoteroDataModel;
}

interface NoteroViewState {
  user: IUser;
  users: IUser[];
  notes: INoteWithVotes[];
  items: IItem[];
  title: string;
}

export const NoteroView: FC<NoteroViewProps> = (props) => {
  const generateState = () => {
    return {
      user: props.model.getUser(),
      users: props.model.getUsers(),
      notes: props.model.getNotesFromBoard(),
      items: props.model.getItems(),
      title: props.model.getTitle(),
    };
  };
  const [state, setState] = useState<NoteroViewState>(generateState());
  const [highlightMine, setHighlightMine] = useState<boolean>();

  // Setup a listener that
  useEffect(() => {
    const onChange = () => setState(generateState());
    props.model.on("change", onChange);

    // useEffect runs after the first render so we will update the view again incase there
    // were changes that came into the model in between generating initialState and setting
    // the above event handler
    onChange();
    return () => {
      // When the view dismounts remove the listener to avoid memory leaks
      props.model.off("change", onChange);
    };
  }, []);

  return (
    <div>
      <Pad
        createNote={props.model.createNote}
        demo={props.model.createDemoNote}
        user={state.user}
        users={state.users}
        clear={() => alert("clear not implemented")}
        setHighlightMine={setHighlightMine}
        highlightMine={highlightMine}
      />
      <Board
        notes={state.notes}
        vote={props.model.vote}
        user={state.user}
        highlightMine={highlightMine}
      />
      <List
        createItem={props.model.createItem}
        submit={props.model.submit}
        demo={props.model.createDemoNote}
        items={state.items}
        user={state.user}
        title={state.title}
      />
    </div>
  );
};
