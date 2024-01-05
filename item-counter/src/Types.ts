import { AzureMember } from "@fluidframework/azure-client";

export type Position = Readonly<{ x: number; y: number }>;

export type NoteData = Readonly<{
	id: any;
	lastEdited: { userId: string; userName: string; time: number };
	text?: string;
	author: AzureMember;
	position: Position;
	numLikesCalculated: number;
	didILikeThisCalculated: boolean;
	color: ColorId;
}>;

export type ColorId = "Blue" | "Green" | "Yellow" | "Pink" | "Purple" | "Orange";
