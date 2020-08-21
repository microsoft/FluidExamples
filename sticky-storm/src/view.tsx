/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, FC, ChangeEvent, KeyboardEvent } from "react";
import {
  INote,
  INoteroDataModel,
  INoteWithVotes,
  IUser,
} from "./fluid-object/interfaces";

// eslint-disable-next-line import/no-unassigned-import
import "./styles.scss";

// NoteroView
interface NoteroViewState {
  user: IUser;
  users: IUser[];
  notes: INoteWithVotes[];
}

export interface NoteroViewProps {
  model: INoteroDataModel;
}

export const NoteroView: FC<NoteroViewProps> = (props) => {
  const generateState = () => {
    return {
      user: props.model.getUser(),
      users: props.model.getUsers(),
      notes: props.model.getNotesFromBoard(),
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
    </div>
  );
}

// Board

interface BoardProps {
  notes: INoteWithVotes[];
  vote: (note: INote) => void;
  user: IUser;
  highlightMine: boolean;
}

const Board: FC<BoardProps> = (props) => {
  return (
    <div className="board">
      {props.notes.map((note) =>
        <Note
          key={note.id}
          note={note}
          handleClick={props.vote}
          count={note.votes}
          user={props.user}
          highlightMine={props.highlightMine}
        />
      )}
    </div>
  );
}

// Pad
interface PadProps {
  createNote: (text: string) => void;
  demo: () => string;
  user: IUser;
  users: IUser[];
  clear: () => void;
  setHighlightMine: (value: boolean) => void;
  highlightMine: boolean;
}



const Pad: FC<PadProps> = (props) => {
  const [value, setValue] = useState<string>('');

  const onCreate = () => {
    props.createNote(value);
    setValue('');
  }
  const handleHighlight = () => {
    props.setHighlightMine(!props.highlightMine)
  }

  const onNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }

  const onNoteFocus = () => {
    if (!value.length) {
      setValue(props.demo());
    }
  }

  return (
    <div className="container">
      <div className="pad">
        <NoteEditor
          onFocus={onNoteFocus}
          value={value}
          onChange={onNoteChange}
          onEnter={onCreate}
        />
        <Button
          disabled={false}
          text={"Share my idea"}
          onClick={onCreate}
        />
        <Button
          disabled={false}
          text={(props.highlightMine) ? "Stop highlighting" : "Highlight my ideas"}
          onClick={handleHighlight}
        />
        <Button
          disabled={false}
          text={"Tidy up"}
          onClick={props.clear}
        />
        <UserName user={props.user} userCount={props.users.length} />
      </div>
    </div>
  );
}

// UserName

interface UserNameProps {
  user: IUser;
  userCount: number;
}

const UserName: FC<UserNameProps> = (props) => {
  return (
    <div className="userName">
      <span>{props.user.name} </span>
      <span className="userCount">
        (with {props.userCount - 1} other {((props.userCount == 2) ? "person" : "people")})
      </span>
    </div>
  )
}

// Note Editor

interface NoteEditorProps extends React.AllHTMLAttributes<HTMLTextAreaElement> {
  onEnter: () => void;
}

const NoteEditor: FC<NoteEditorProps> = (props) => {

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      props.onEnter();
    }
  }

  return (
    <div className="note editor">
      <textarea
        className="note-text"
        onKeyDown={onKeyDown}
        onChange={props.onChange}
        value={props.value}
        onFocus={props.onFocus}
      />
    </div>
  );
}

// Button

interface ButtonProps {
  disabled: boolean;
  text: string;
  onClick: () => void;
}

export function Button(props: ButtonProps) {
  return <button disabled={props.disabled} onClick={props.onClick}> {props.text} </button>
}

interface NoteProps {
  count: number;
  note: INoteWithVotes;
  user: IUser;
  handleClick: (note: INote) => void;
  highlightMine: boolean;
}

function Note(props: NoteProps) {
  return (
    <div
      className={((props.note.user.id != props.user.id) && props.highlightMine) ? "note others" : "note"}
      onClick={() => props.handleClick(props.note)}>
      <Badge count={props.count} note={props.note} />
      <NoteContent note={props.note} />
    </div>
  );
}

interface NoteContentProps {
  note: INoteWithVotes;
}

function NoteContent(props: NoteContentProps) {
  return (
    <div className="note-text">
      {props.note.text}
    </div>
  );
}

interface BadgeProps {
  count: number;
  note: INoteWithVotes;
}

function Badge(props: BadgeProps) {
  let badgeClass = "note-badge";

  if (props.note.currentUserVoted) {
    badgeClass = "note-badge voted"
  }

  if (props.count > 0) {
    return <div className={badgeClass}>{props.count}</div>
  } else {
    return null;
  }
}