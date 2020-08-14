import { INote, IUser, INoteWithVotes } from "./interfaces";
/**
 * This class is never used to create objects that are stored in Fluid DDSs.
 */
export class NoteWithVotes implements INoteWithVotes {
    public text: string;
    public user: IUser;
    public id: string;
    constructor(note: INote, public votes: number, public currentUserVoted: boolean) {
        this.text = note.text;
        this.user = note.user;
        this.id = note.id;
    }
}