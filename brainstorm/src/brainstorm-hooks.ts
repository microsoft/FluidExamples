import { AzureMember } from '@fluidframework/azure-client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFluidContext } from './core/use-fluid-context';
import { useMyself } from './core/use-myself';
import { uuidv4 } from './core/uuidv4';
import { useFluidState, useFluidStateForPrefix } from './core/use-fluid-state';
import {
  ColorId,
  LastEditedObject,
  LikeObject,
  MemberCursorObject,
  NoteStatus,
  Position,
} from './Types';
import { values } from 'lodash';

const c_NoteIdPrefix = 'noteId_';
const c_PositionPrefix = 'position_';
const c_CursorPrefix = 'cursor_';
const c_AuthorPrefix = 'author_';
const c_LastEditedPrefix = 'lastEdited_';
const c_votePrefix = 'vote_';
const c_TextPrefix = 'text_';
const c_ColorPrefix = 'color_';

export function useNotePosition(noteId: string) {
  return useFluidState<Position>(c_PositionPrefix + noteId);
}

export function useNoteText(noteId: string) {
  return useFluidState<string>(c_TextPrefix + noteId);
}

export function useNoteAuthor(noteId: string) {
  return useFluidState<AzureMember>(c_AuthorPrefix + noteId);
}

export function useNoteColor(noteId: string) {
  return useFluidState<ColorId>(c_ColorPrefix + noteId);
}

export function useNoteStatus(noteId: string) {
  return useFluidState<NoteStatus>(c_NoteIdPrefix + noteId);
}

export function useNoteLastModified(noteId: string) {
  return useFluidState<LastEditedObject>(c_LastEditedPrefix + noteId);
}

export function useNoteVotesList(noteId: string) {
  return useFluidStateForPrefix<LikeObject>(c_votePrefix + noteId);
}

export function useNoteLikeForUser(noteId: string, userId: string) {
  return useFluidState<LikeObject>(c_votePrefix + noteId + '_' + userId);
}

export function useMemberCursorPosition(userId: string) {
  return useFluidState<MemberCursorObject>(c_CursorPrefix + userId);
}

export function useNotDeletedNotes() {
  const notesStatus = useFluidStateForPrefix<NoteStatus>(c_NoteIdPrefix);

  const notesIds = useMemo(() => {
    const ids: string[] = [];
    for (const key in notesStatus) {
      if (notesStatus[key] !== NoteStatus.Deleted) {
        ids.push(key.replace(c_NoteIdPrefix, ''));
      }
    }

    return ids;
  }, [notesStatus]);

  return notesIds;
}

export function useSetNotePositionById() {
  const { sharedMap } = useFluidContext();
  return (noteId: string, left: number, top: number) => {
    sharedMap.set(c_PositionPrefix + noteId, {
      x: left > 0 ? left : 0,
      y: top > 0 ? top : 0,
    });
  };
}

export function useCreateNewNote(
  color: ColorId,
  positionCreator: () => Position,
) {
  const myself = useMyself();
  const noteIdRef = useRef(uuidv4());
  const noteId = noteIdRef.current;

  const [noteStatus, setNoteStatus] = useNoteStatus(noteId);
  const [, setAuthor] = useNoteAuthor(noteId);
  const [, setNotePosition] = useNotePosition(noteId);
  const [, setColor] = useNoteColor(noteId);

  const createNewNote = useCallback(() => {
    const position = positionCreator();
    setNotePosition(position);
    setAuthor(myself!);
    setColor(color);
    setNoteStatus(NoteStatus.Active);
    noteIdRef.current = uuidv4();
  }, [noteStatus, color, noteId]);

  return createNewNote;
}

export function useLikeStats(noteId: string) {
  const allLikes = useNoteVotesList(noteId);

  const likes = values(allLikes).filter((v) => v !== undefined) as LikeObject[];
  const numLikes = likes.length;

  return { numLikes };
}

export function useDidILike(noteId: string) {
  const myself = useMyself();

  const [like, setLike, deleteLike] = useNoteLikeForUser(noteId, myself.userId);

  const toggleLike = useCallback(() => {
    if (like) {
      deleteLike();
    } else {
      setLike({
        userId: myself.userId,
        userName: myself.userName,
      });
    }
  }, [like, myself.userId]);

  return {
    didILike: like !== undefined,
    toggleLike,
  };
}
