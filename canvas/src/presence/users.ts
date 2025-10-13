/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * Users Manager Implementation
 *
 * This module provides the concrete implementation of the UsersManager interface
 * for managing user presence and information in the Fluid Framework demo app.
 *
 * Key Features:
 * - Real-time user presence tracking across all clients
 * - User profile management (name, avatar, etc.)
 * - Connection state monitoring (connected/disconnected users)
 * - Current user (myself) information management
 * - User list synchronization and event-driven updates
 * - Comprehensive user filtering by connection status
 *
 * The users manager uses Fluid Framework's presence system to maintain
 * an up-to-date list of all users in the collaboration session, including
 * their profile information and connection status.
 */

import {
	StateFactory,
	LatestEvents,
	StatesWorkspace,
	Latest,
	AttendeeStatus,
} from "@fluidframework/presence/beta";
import { UsersManager, User } from "./Interfaces/UsersManager.js";
import { Listenable } from "fluid-framework";
import { UserInfo, validateUserInfo } from "./validators.js";

/**
 * Creates a new UsersManager instance with the given workspace configuration
 * and initial user information.
 *
 * @param props - Configuration object containing workspace, name, and initial user info
 * @param props.workspace - The states workspace for state synchronization
 * @param props.name - Unique name for this users manager instance
 * @param props.me - Initial user information for the current user
 * @returns A configured UsersManager instance
 */
export function createUsersManager(props: {
	workspace: StatesWorkspace<{}>;
	name: string;
	me: UserInfo;
}): UsersManager {
	const { workspace, name, me } = props;

	/**
	 * Concrete implementation of the UsersManager interface.
	 * Handles user presence tracking and profile management.
	 */
	class UsersManagerImpl implements UsersManager {
		/** Fluid Framework state object for real-time synchronization */
		state: Latest<UserInfo>;

		/**
		 * Initializes the users manager with Fluid Framework state management.
		 * Sets up the latest state factory with validation and registers with the workspace.
		 *
		 * @param name - Unique identifier for this users manager
		 * @param workspace - Fluid workspace for state synchronization
		 */
		constructor(name: string, workspace: StatesWorkspace<{}>) {
			// Register this users manager's state with the Fluid workspace
			// Using validated Latest state to ensure data integrity
			workspace.add(name, StateFactory.latest({ local: me, validator: validateUserInfo }));
			this.state = workspace.states[name];
		}

		/**
		 * Event emitter for user information changes.
		 * Components can subscribe to these events to update their UI when user data changes.
		 */
		public get events(): Listenable<LatestEvents<UserInfo>> {
			return this.state.events;
		}

		/**
		 * Client management interface providing access to attendees and their information.
		 * This allows the selection manager to know who is connected and get their details.
		 */
		public get attendees() {
			return this.state.presence.attendees;
		}

		/**
		 * Gets all users (both connected and disconnected) in the collaboration session.
		 * Maps remote client data to User objects containing both profile and client information.
		 *
		 * @returns Read-only array of all users with their profile and client data
		 */
		getUsers(): readonly User[] {
			return [...this.state.getRemotes()].map((c) => ({
				value: c.value() as UserInfo,
				client: c.attendee,
			}));
		}

		/**
		 * Gets only the currently connected users.
		 * Filters out disconnected users to show only active collaborators.
		 *
		 * @returns Read-only array of connected users
		 */
		getConnectedUsers(): readonly User[] {
			return this.getUsers().filter(
				(user) => user.client.getConnectionStatus() === AttendeeStatus.Connected
			);
		}

		/**
		 * Gets users who have disconnected from the session.
		 * Useful for showing recent collaborators or session history.
		 *
		 * @returns Read-only array of disconnected users
		 */
		getDisconnectedUsers(): readonly User[] {
			return this.getUsers().filter(
				(user) => user.client.getConnectionStatus() === AttendeeStatus.Disconnected
			);
		}

		/**
		 * Updates the current user's information and synchronizes it across all clients.
		 * This method should be called when the user's profile changes (name, avatar, etc.).
		 *
		 * @param userInfo - The updated user information to set
		 */
		updateMyself(userInfo: UserInfo): void {
			this.state.local = userInfo; // Update the local state with the new user info
		}

		/**
		 * Gets the current user's complete information including both profile data and client data.
		 * Combines the local user state with the Fluid attendee information.
		 *
		 * @returns User object for the current user (myself)
		 */
		getMyself(): User {
			return {
				value: this.state.local,
				client: this.state.presence.attendees.getMyself(),
			};
		}
	}

	return new UsersManagerImpl(name, workspace);
}
