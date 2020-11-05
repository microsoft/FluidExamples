/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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


export interface IItem {
    id: string;
    text: string;
    user: IUser;
    count: number;
}

export interface INoteWithVotes extends INote {
    currentUserVoted: boolean;
    votes: number;
}

export enum UserType {
    designer = 0,
    responder = 1
}

export interface IUser {
    id: string;
    name: string;
    userType: UserType
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
    getItems: () => IItem[];
    getTitle: () => string;
    createOrChangeTitle: (title: string) => void;
    changeItem: (item: IItem, text: string) => void;
    createItem: (text: string) => void;
    submit: (text: string) => void;
    getSubmitCount: () => number;
    getSubmitIds: () => string[];
    createDemoNote: () => string;
    createNote: (text: string) => void;
    vote: (note: INote) => void;
    on(event: "change", listener: () => void): this;
    off(event: "change", listener: () => void): this;
}