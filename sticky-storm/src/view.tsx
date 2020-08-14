import React, { useState, useEffect } from "react";
import {
  INote,
  INoteroDataModel,
  INoteWithVotes,
  IUser,
} from "./fluid-object/interfaces";

// eslint-disable-next-line import/no-unassigned-import
import "./styles.scss";

interface NoteroViewState {
  user: IUser;
  users: IUser[];
  notes: INoteWithVotes[];
}

export interface NoteroViewProps {
  model: INoteroDataModel;
}

export function NoteroView(props: NoteroViewProps) {
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
        create={props.model.createNote}
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

interface BoardProps {
  notes: INoteWithVotes[];
  vote: (note: INote) => void;
  user: IUser;
  highlightMine: boolean;
}

function Board(props: BoardProps) {
  return (
    <div className="board">
      {props.notes.map((note) => {
        return <Note
          key={note.id}
          note={note}
          handleClick={props.vote}
          count={note.votes}
          user={props.user}
          highlightMine={props.highlightMine}
        />;
      })}
    </div>
  );
}

interface PadProps {
  create: (text: string) => void;
  demo: () => string;
  user: IUser;
  users: IUser[];
  clear: () => void;
  setHighlightMine: React.Dispatch<React.SetStateAction<boolean>>;
  highlightMine: boolean;
}

function Pad(props: PadProps) {
  const [element, setText] = useState<HTMLElement>();

  const handleChange = (element: HTMLElement) => {
    setText(element);
  }

  const handleCreate = () => {
    if (element) {
      props.create(element.innerText);
      element.innerText = "";
    }
  }

  const handleHighlight = () => {
    props.setHighlightMine(!props.highlightMine)
  }

  return (
    <div className="container">
      <div className="pad">
        <NoteEditor
          handleChange={(element: HTMLElement) => handleChange(element)}
          handleCreate={() => handleCreate()} demo={props.demo}
        />
        <Button
          disabled={false}
          text={"Share my idea"}
          handleClick={handleCreate}
        />
        <Button
          disabled={false}
          text={(props.highlightMine) ? "Stop highlighting" : "Highlight my ideas"}
          handleClick={handleHighlight}
        />
        <Button
          disabled={false}
          text={"Tidy up"}
          handleClick={props.clear}
        />
        <UserName user={props.user} users={props.users} />
      </div>
    </div>
  );
}

interface UserNameProps {
  user: IUser;
  users: IUser[];
}

function UserName(props: UserNameProps) {
  return (
    <div className="userName">
      <span>{props.user.name} </span>
      <span className="userCount">
        (with {props.users.length - 1} other {((props.users.length - 1 == 1) ? "person" : "people")})
      </span>
    </div>
  )
}

interface NoteEditorProps {
  handleChange: (target: EventTarget) => void;
  handleCreate: () => void;
  demo: () => string;
}

function NoteEditor(props: NoteEditorProps) {
  const onEnterPress = (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      props.handleCreate();
    }
  }

  const handleFocus = (e) => {
    if (!e.target.innerText) {
      e.target.innerText = props.demo();
      props.handleChange(e.target);
    }
  }

  return (
    <div className="note editor">
      <div
        contentEditable
        className="note-text"
        onInput={(e) => props.handleChange(e.target)}
        onKeyDown={onEnterPress}
        onFocus={handleFocus}
      />
    </div>
  );  
}

interface ButtonProps {
  disabled: boolean;
  text: string;
  handleClick: () => void;
}

export function Button(props: ButtonProps) {
  if (props.disabled) {
    return <button      
      disabled>{props.text}
    </button>
  } else {
    return <button      
      onClick={props.handleClick}>
      {props.text}
    </button>
  }
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