import { IUser } from "./utils";

export type Position = Readonly<{ x: number; y: number }>;

export type NoteData = Readonly<{
  id: any;
  text?: string;
  author: IUser;
  position: Position;
  numLikesCalculated: number;
  didILikeThisCalculated: boolean;
  color?: ColorId;
}>;

export type ColorId =
  | "Blue"
  | "Green"
  | "Yellow"
  | "Pink"
  | "Purple"
  | "Orange";
