import { IStyle, mergeStyles, ThemeProvider } from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import React from "react";
import { useDrop } from 'react-dnd';
import { NoteData, Position } from "../Types";
import { Note } from "./Note";
import { BrainstormModel } from "../BrainstormModel";
import { lightTheme } from "./Themes";

export type NoteSpaceProps = Readonly<{
  model: BrainstormModel;
  author: FrsMember;
}>;

export function NoteSpace(props: NoteSpaceProps) {
  const { model } = props;
  const [notes, setNotes] = React.useState<readonly NoteData[]>([]);

  // This runs when via model changes whether initiated by user or from external
  React.useEffect(() => {
    const syncLocalAndFluidState = () => {
      const noteDataArr = [];
      const ids: string[] = model.NoteIds;

      // Recreate the list of cards to re-render them via setNotes
      for (let noteId of ids) {
        const newCardData: NoteData = model.CreateNote(noteId, props.author);
        noteDataArr.push(newCardData);
      }
      setNotes(noteDataArr);
    };

    syncLocalAndFluidState();
    model.setChangeListener(syncLocalAndFluidState);
    return () => model.removeChangeListener(syncLocalAndFluidState);
  }, [model, props.author]);

  const rootStyle: IStyle = {
    flexGrow: 1,
    position: "relative",
    margin: "10px",
    borderRadius: "2px",
  };

  const spaceClass = mergeStyles(rootStyle);

  const [, drop] = useDrop(() => ({
    accept: 'note',
    drop(item: any, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset()!;
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);
      model.MoveNote(item.id, {
        x: left > 0 ? left : 0,
        y: top > 0 ? top : 0
      })
      return undefined;
    },
  }), [model]);

  return (
    <div id="NoteSpace" ref={drop} className={spaceClass}>
      <ThemeProvider theme={lightTheme}>
        {notes.map((note, i) => {
          const setPosition = (position: Position) => {
            model.MoveNote(note.id, position);
          };

          const setText = (text: string) => {
            model.SetNoteText(note.id, text);
          };

          const onLike = () => {
            model.LikeNote(note.id, props.author);
          };

          const getLikedUsers = () => {
            return model.GetNoteLikedUsers(note.id);
          };

          const onDelete = () => {
            model.DeleteNote(note.id);
          };

          const onColorChange = (color: string) => {
            model.SetNoteColor(note.id, color);
          };

          return (
            <Note
              {...note}
              id={note.id}
              key={note.id}
              text={note.text}
              setPosition={setPosition}
              onLike={onLike}
              getLikedUsers={getLikedUsers}
              onDelete={onDelete}
              onColorChange={onColorChange}
              setText={setText}
            />
          );
        })}
      </ThemeProvider>
    </div>
  );
}
