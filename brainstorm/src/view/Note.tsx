import {
  mergeStyles,
} from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import React from "react";
import { useDrag } from "react-dnd";
import { DefaultColor } from "./Color";
import {
  getRootStyleForColor
} from "./Note.style";
import { NoteData, Position } from "../Types";
import { NoteHeader } from "./NoteHeader";
import { NoteBody } from "./NoteBody";

export type NoteProps = Readonly<{
  id: string;
  setPosition: (position: Position) => void;
  onLike: () => void;
  getLikedUsers: () => FrsMember[];
  onDelete: () => void;
  onColorChange: (color: string) => void;
  setText: (text: string) => void;
}> &
  Pick<
    NoteData,
    | "author"
    | "position"
    | "color"
    | "didILikeThisCalculated"
    | "numLikesCalculated"
    | "text"
  >;

export function Note(props: NoteProps) {
  const {
    id,
    position: { x: left, y: top },
    color = DefaultColor,
    setText,
    text
  } = props;

  const [, drag] = useDrag(
    () => ({
      type: "note",
      item: { id, left, top },
    }),
    [id, left, top]
  );

  const rootClass = mergeStyles(getRootStyleForColor(color));

  return (
    <div className={rootClass} ref={drag} style={{ left, top }}>
      <NoteHeader {...props} />
      <NoteBody setText={setText} text={text} color={color} />
    </div>
  );
}




