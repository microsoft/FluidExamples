import { FluidContainer, ISharedMap, SharedMap } from "@fluid-experimental/fluid-framework";
import { FrsMember } from "@fluid-experimental/frs-client";
import { NoteData, Position } from "./Types";

const c_NoteIdPrefix = "noteId_";
const c_PositionPrefix = "position_";
const c_AuthorPrefix = "author_";
const c_votePrefix = "vote_";
const c_TextPrefix = "text_";
const c_ColorPrefix = "color_";

export type BrainstormModel = Readonly<{
  CreateNote(noteId: string, myAuthor: FrsMember): NoteData;
  MoveNote(noteId: string, newPos: Position): void;
  SetNote(noteId: string, newCardData: NoteData): void;
  SetNoteText(noteId: string, noteText: string): void;
  SetNoteColor(noteId: string, noteColor: string): void;
  LikeNote(noteId: string, author: FrsMember): void;
  GetNoteLikedUsers(noteId: string): FrsMember[];
  DeleteNote(noteId: string): void;
  NoteIds: string[];
  setChangeListener(listener: () => void): void;
  removeChangeListener(listener: () => void): void;
}>;

export function createBrainstormModel(fluid: FluidContainer): BrainstormModel {
  const sharedMap: ISharedMap = fluid.initialObjects.map as SharedMap;

  const IsCompleteNote = (noteId: string) => {
    if (
      !sharedMap.get(c_PositionPrefix + noteId) ||
      !sharedMap.get(c_AuthorPrefix + noteId)
    ) {
      return false;
    }
    return true;
  };


  const IsDeletedNote = (noteId: string) => {
    return sharedMap.get(c_NoteIdPrefix + noteId) === 0;
  };

  const SetNoteText = (noteId: string, noteText: string) => {
    sharedMap.set(c_TextPrefix + noteId, noteText);
  };

  const SetNoteColor = (noteId: string, noteColor: string) => {
    sharedMap.set(c_ColorPrefix + noteId, noteColor);
  };


  return {
    CreateNote(noteId: string, myAuthor: FrsMember): NoteData {
      const newNote: NoteData = {
        id: noteId,
        text: sharedMap.get(c_TextPrefix + noteId),
        position: sharedMap.get(c_PositionPrefix + noteId)!,
        author: sharedMap.get(c_AuthorPrefix + noteId)!,
        numLikesCalculated: Array.from(sharedMap
          .keys())
          .filter((key: string) => key.includes(c_votePrefix + noteId))
          .filter((key: string) => sharedMap.get(key) !== undefined).length,
        didILikeThisCalculated:
          Array.from(sharedMap
            .keys())
            .filter((key: string) =>
              key.includes(c_votePrefix + noteId + "_" + myAuthor.userId)
            )
            .filter((key: string) => sharedMap.get(key) !== undefined).length > 0,
        color: sharedMap.get(c_ColorPrefix + noteId)!,
      };
      return newNote;
    },

    GetNoteLikedUsers(noteId: string): FrsMember[] {
      return (
        Array.from(sharedMap
          .keys())
          // Filter keys that represent if a note was liked
          .filter((key: string) => key.startsWith(c_votePrefix + noteId))
          .filter((key: string) => sharedMap.get(key) !== undefined)
          // Return the user associated with the like
          .map((value: string) => sharedMap.get(value)!)
      );
    },

    MoveNote(noteId: string, newPos: Position) {
      sharedMap.set(c_PositionPrefix + noteId, newPos);
    },

    SetNote(noteId: string, newCardData: NoteData) {
      sharedMap.set(c_PositionPrefix + noteId, newCardData.position);
      sharedMap.set(c_AuthorPrefix + noteId, newCardData.author);
      SetNoteText(newCardData.id, newCardData.text!);
      sharedMap.set(c_NoteIdPrefix + noteId, 1);
      sharedMap.set(c_ColorPrefix + noteId, newCardData.color);
    },

    SetNoteText,

    SetNoteColor,

    LikeNote(noteId: string, author: FrsMember) {
      const voteString = c_votePrefix + noteId + "_" + author.userId;
      sharedMap.get(voteString) === author
        ? sharedMap.set(voteString, undefined)
        : sharedMap.set(voteString, author);
    },

    DeleteNote(noteId: string) {
      sharedMap.set(c_NoteIdPrefix + noteId, 0);
    },

    get NoteIds(): string[] {
      return (
        Array.from(sharedMap
          .keys())
          // Only look at keys which represent if a note exists or not
          .filter((key: String) => key.includes(c_NoteIdPrefix))
          // Modify the note ids to not expose the prefix
          .map((noteIdWithPrefix) =>
            noteIdWithPrefix.substring(c_NoteIdPrefix.length)
          )
          // Remove notes which are incomplete or deleted
          .filter((noteId) => IsCompleteNote(noteId) && !IsDeletedNote(noteId))
      );
    },

    setChangeListener(listener: () => void): void {
      sharedMap.on("valueChanged", listener);
    },

    removeChangeListener(listener: () => void): void {
      sharedMap.off("valueChanged", listener);
    }
  };
}
