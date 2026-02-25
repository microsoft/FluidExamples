/**
 * Authentication Context
 *
 * React context for managing Microsoft Authentication Library (MSAL) instance
 * throughout the Fluid Framework demo application. This context provides access
 * to the MSAL instance for authentication operations like sign-in, sign-out,
 * and token acquisition.
 *
 * Key Features:
 * - Centralized MSAL instance management
 * - Type-safe authentication context
 * - Easy access to authentication state across components
 * - Integration with Microsoft Graph API authentication
 *
 * The context is populated during app initialization and used by components
 * that need to interact with Microsoft authentication services.
 */

import { createContext } from "react";
import { PublicClientApplication } from "@azure/msal-browser";

/**
 * Type definition for the Authentication Context.
 * Contains the MSAL instance and related authentication state.
 */
export interface AuthContextType {
	/**
	 * The Microsoft Authentication Library (MSAL) public client application instance.
	 * Used for all authentication operations including sign-in, sign-out, and token acquisition.
	 * Will be null until the MSAL instance is properly initialized.
	 */
	msalInstance: PublicClientApplication | null;
}

/**
 * React context for managing authentication state and MSAL instance.
 * Provides access to authentication functionality throughout the component tree.
 *
 * Default value has msalInstance as null, which will be replaced with the
 * actual MSAL instance when the AuthContext.Provider is used in the app.
 */
export const AuthContext = createContext<AuthContextType>({
	msalInstance: null,
});
