/**
 * UsersManager Interface
 *
 * Manages user presence and information in the Fluid Framework demo app.
 * This interface extends PresenceManager to provide comprehensive user management
 * functionality including tracking connected/disconnected users, managing user profiles,
 * and synchronizing user information across all clients.
 *
 * Key Features:
 * - Real-time user presence tracking
 * - User profile management (name, avatar, etc.)
 * - Connection state monitoring
 * - Current user (myself) management
 * - User list synchronization across clients
 */

import { Attendee } from "@fluidframework/presence/beta";
import { PresenceManager } from "./PresenceManager.js";
import { UserInfo } from "../validators.js";

// Re-export type for external consumers
export type { UserInfo };

/**
 * UsersManager interface for managing user presence and information in the collaborative app.
 * Extends PresenceManager to provide real-time synchronization of user data.
 *
 * @template TUserInfo - The type of user information, defaults to UserInfo
 */
export interface UsersManager<TUserInfo extends UserInfo = UserInfo>
	extends PresenceManager<TUserInfo> {
	/**
	 * Gets the complete list of users (both connected and disconnected).
	 * Useful for displaying full user history or maintaining user context.
	 *
	 * @returns The current list of all users with their client information
	 *
	 * Use cases:
	 * - Displaying user list in sidebar
	 * - Showing recent collaborators
	 * - User history tracking
	 */
	getUsers(): readonly User<TUserInfo>[];

	/**
	 * Gets only the currently connected users.
	 * This is the most commonly used method for active collaboration features.
	 *
	 * @returns The current list of connected users (excluding disconnected ones)
	 *
	 * Use cases:
	 * - Showing active collaborators
	 * - Presence indicators
	 * - Real-time collaboration features
	 * - User avatars in active session
	 */
	getConnectedUsers(): readonly User<TUserInfo>[];

	/**
	 * Gets users who have disconnected from the session.
	 * Useful for showing recent activity or maintaining session history.
	 *
	 * @returns The current list of disconnected users
	 *
	 * Use cases:
	 * - Showing recent collaborators who left
	 * - Session history
	 * - Re-connection notifications
	 */
	getDisconnectedUsers(): readonly User<TUserInfo>[];

	/**
	 * Updates the current user's information and syncs it across all clients.
	 * This should be called when user profile changes or during initial setup.
	 *
	 * @param userInfo - The updated user information to set
	 *
	 * Use cases:
	 * - Initial user setup after authentication
	 * - Profile picture updates
	 * - Display name changes
	 * - User preference updates
	 */
	updateMyself(userInfo: TUserInfo): void;

	/**
	 * Gets the current user's information and client data.
	 *
	 * @returns The current user (myself) with full client information
	 *
	 * Use cases:
	 * - Displaying current user's profile
	 * - User-specific operations
	 * - Checking current user's permissions
	 * - Self-identification in collaborative operations
	 */
	getMyself(): User<TUserInfo>;
}

/**
 * User type definition combining user information with Fluid client data.
 * Links user profile data with their session client information.
 *
 * @template TUserInfo - The type of user information
 */
export type User<TUserInfo extends UserInfo = UserInfo> = {
	/** The user's profile information (name, avatar, etc.) */
	value: TUserInfo;
	/** The Fluid Framework client/attendee associated with this user */
	client: Attendee;
};
