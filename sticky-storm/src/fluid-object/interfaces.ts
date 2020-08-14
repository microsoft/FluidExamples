/**
 * Note that the model primarily uses interfaces, not classes.
 * When objects are stored in Fluid DDSs,
 * they are serialized and deserialized over the wire.
 * Using interfaces avoids any issues with calling functions 
 * that are no longer present on an object. 
 */
   
export interface INote {
    id: string;
    text: string;
    user: IUser;
}

export interface INoteWithVotes extends INote {
    currentUserVoted: boolean;
    votes: number;
}

export interface IUser {
    id: string;
    name: string;
}

export interface IBallot {
    id: string,
    noteId: string,
    user: IUser
}

export interface INoteroDataModel {
    getUsers: () => IUser[];
    getUser: () => IUser;
    addUser: () => void;
    getNotesFromBoard: () => INoteWithVotes[];
    createDemoNote: () => string;
    createNote: (text: string) => void;
    vote: (note: INote) => void;
    on(event: "change", listener: () => void): this;
    off(event: "change", listener: () => void): this;
}