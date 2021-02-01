/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { v4 as uuidv4 } from "uuid";
<<<<<<< HEAD
import {
  DataObject,
  DataObjectFactory,
  SharedMap,
  IFluidHandle,
} from "@fluid-experimental/experimental-fluidframework";
=======
import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct";
import { SharedMap } from "@fluidframework/map";
import { IFluidHandle } from "@fluidframework/core-interfaces";
>>>>>>> main

import { IBallot, INote, INoteroDataModel, IUser } from "./interfaces";
import { NoteWithVotes } from "./NoteWithVotes";
import { AutoNote, FakeUser } from "./demo";

export class Notero extends DataObject implements INoteroDataModel {
  // Local references to the SharedMaps used in this component
  private notesMap: SharedMap;
  private votesMap: SharedMap;
  private usersMap: SharedMap;

  // stores a fake userId as we aren't using true auth for this demo
  private userId: string;

  /**
   * initializingFirstTime is called only once,
   * it is executed only by the first client to open the
   * component and all work will resolve before the view
   * is presented to any user.
   *
   * This method is used to perform component setup,
   * which can include setting an initial schema or initial values.
   */
  protected async initializingFirstTime() {
    // Create SharedMaps for the notes, votes, and users
    this.createSharedMap("notes");
    this.createSharedMap("votes");
    this.createSharedMap("users");
  }

  /**
   * Creates a shared map with the provided id. The id must be unique.
   */
  private createSharedMap(id: string): void {
    const map = SharedMap.create(this.runtime);
    this.root.set(id, map.handle);
  }

  /**
   * hasInitialized is called every
   * time a client joins a session.
   *
   * This method is used to perform tasks required
   * for each client like initializing event listeners.
   */
  protected async hasInitialized() {
    // Create local references to the SharedMaps.
    // Otherwise, they need to be called async which is inconvenient.
    this.notesMap = await this.root.get<IFluidHandle<SharedMap>>("notes").get();
    this.votesMap = await this.root.get<IFluidHandle<SharedMap>>("votes").get();
    this.usersMap = await this.root.get<IFluidHandle<SharedMap>>("users").get();

    // Add the current user to set of collaborators.
    this.addUser();

    // Set up event listeners to update the ui when data changes
    this.createEventListeners(this.notesMap);
    this.createEventListeners(this.votesMap);
    this.createEventListeners(this.usersMap);
  }

  /**
   * Helper function to set up event listeners for shared objects
   */
  private createEventListeners(sharedMap: SharedMap): void {
    // Set up an event listener for changes to values in the SharedMap
    sharedMap.on("valueChanged", () => {
      this.emit("change");
    });

    //Set up an event listener for clearing the data in a SharedMap
    sharedMap.on("clear", () => {
      this.emit("change");
    });

    const quorum = this.context.getQuorum();
    quorum.on("addMember", () => {
      this.emit("change");
    });
<<<<<<< HEAD

    quorum.on("removeMember", () => {
      this.emit("change");
    });
  }

  public createDemoNote = (): string => {
    return AutoNote.createDemoNote();
  };

  /*
   * Creates a note and adds it to the notesMap SharedMap
   */
  public createNote = (text: string): void => {
    if (text) {
      const note: INote = {
        id: uuidv4(),
        text: text,
        user: this.getUser(),
      };
      this.notesMap.set(note.id, note);
    }
  };

  /*
   * Adds or removes a "ballot" to the vote count for a note
   */
  public vote = (note: INote): void => {
    // Gets the current user
    const user = this.getUser();

    // Create a unique id keyed off the current user id and the note id
    const id = note.id + user.id;

    // Create a ballot object literal that encapsulates the information about
    // the vote to store in the votesMap Fluid DDS
    const ballot: IBallot = {
      id: id,
      noteId: note.id,
      user: user,
    };

=======

    quorum.on("removeMember", () => {
      this.emit("change");
    });
  }

  public createDemoNote = (): string => {
    return AutoNote.createDemoNote();
  };

  /*
   * Creates a note and adds it to the notesMap SharedMap
   */
  public createNote = (text: string): void => {
    if (text) {
      const note: INote = {
        id: uuidv4(),
        text: text,
        user: this.getUser(),
      };
      this.notesMap.set(note.id, note);
    }
  };

  /*
   * Adds or removes a "ballot" to the vote count for a note
   */
  public vote = (note: INote): void => {
    // Gets the current user
    const user = this.getUser();

    // Create a unique id keyed off the current user id and the note id
    const id = note.id + user.id;

    // Create a ballot object literal that encapsulates the information about
    // the vote to store in the votesMap Fluid DDS
    const ballot: IBallot = {
      id: id,
      noteId: note.id,
      user: user,
    };

>>>>>>> main
    // Check to see if the current user already voted.
    // If so, remove the vote, otherwise, add it
    if (this.votesMap.has(ballot.id)) {
      this.votesMap.delete(ballot.id); // removes the ballot from the votesMap
    } else {
      this.votesMap.set(ballot.id, ballot); // adds the ballot to the votesMap
    }
  };

  /**
   * Fetches notes and their votes from the notesMap SharedMap
   * and the votesMap SharedMap and packages them in an array
   * of local objects (NoteWithVotes) for consumption by the React ui
   */
  public getNotesFromBoard = (): NoteWithVotes[] => {
    // Initialize an array of objects that will contain all the
    // information necessary for React to render the notes
    let notes: NoteWithVotes[] = [];

    // Call a function that returns a map of note ids,
    // the number of votes each note received
    // and whether the current user voted
    const votes = this.countVotes();

    // Iterate through all the notes to populate the array of NoteWithVotes
    // objects to pass into the React UI
    this.notesMap.forEach((i: INote) => {
      let numVotes = 0;
      let voted = false;
      if (votes.has(i.id)) {
        numVotes = votes.get(i.id).count;
        voted = votes.get(i.id).voted;
      }
      notes.push(new NoteWithVotes(i, numVotes, voted));
    });
    return notes;
  };

  /**
   * Uses the votesMap and the notesMap SharedMaps to aggregate votes for
   * consumption by the React ui - called by getNotesFromBoard()
   */
  private countVotes(): Map<string, { count: number; voted: boolean }> {
    // Initialize a map indexed on note id where the value is an
    // object literal containing the vote count and
    // whether the current user voted
    let voteCounts = new Map();

    // Get the current user
    const user = this.getUser();

    // Iterate through all the "ballots" in votesMap to count them
    // and put them in the voteCounts map
    this.votesMap.forEach((i: IBallot) => {
      // Check if there is already an item with this note's id
      if (voteCounts.has(i.noteId)) {
        // Update the vote count by one and test to see if
        // this vote came from the current user and set
        // voted to true if it did
        voteCounts.set(i.noteId, {
          count: voteCounts.get(i.noteId).count + 1,
          voted: i.user.id == user.id || voteCounts.get(i.noteId).voted,
        });
      } else {
        // Create a new item with indexed on the current note id and see if this vote came from the
        // current user and set voted to true if it did
        voteCounts.set(i.noteId, {
          count: 1,
          voted: i.user.id == user.id,
        });
      }
    });
    return voteCounts;
  }

  /**
   * Creates a "fake" user based on a fake user id and a fake name.
   * Only use this code for protoyping and demos.
   */
  public addUser = (): void => {
    // Check for a userId in SessionStorage - this prevents refresh from generating a new user
    if (
      sessionStorage.getItem("userId") &&
      this.usersMap.get<IUser>(sessionStorage.getItem("userId"))
    ) {
      this.userId = sessionStorage.getItem("userId"); //This session might have has a user
    } else {
      const user: IUser = {
        id: FakeUser.getFakeUserId(),
        name: FakeUser.getFakeName(),
      };
      this.userId = user.id;
      sessionStorage.setItem("userId", user.id);
      this.usersMap.set(user.id, user);
    }
  };

  /**
   * Get the IUser literal object for the current user.
   */
  public getUser = (): IUser => {
    return this.usersMap.get<IUser>(this.userId);
  };

  /**
   * Get an array of all IUser literal objects for users
   * who have joined the session (even if they have left).
   */
  public getUsers(): IUser[] {
    const users: IUser[] = [];
    this.usersMap.forEach((i: IUser) => {
      users.push(i);
    });
    return users;
  }
}

/**
 * The DataObjectFactory declares the component
 * and defines any additional distributed data structures.
 * To add a SharedSequence, SharedMap, or any other
 * structure, put it in the array below.
 *
 * Note: This project uses SharedMap so it is added below...
 */
export const NoteroInstantiationFactory = new DataObjectFactory(
  "Notero",
  Notero,
  [SharedMap.getFactory()],
  {}
);
