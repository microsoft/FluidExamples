/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Microsoft Graph Service
 *
 * This module provides functionality for interacting with Microsoft Graph API
 * to fetch user profile information and pictures. It includes robust fallback
 * mechanisms to handle different account types (MSA, Azure AD, etc.) and
 * network connectivity issues.
 *
 * Features:
 * - Profile picture fetching with metadata validation
 * - Multiple fallback strategies for different account types
 * - Avatar generation using DiceBear API when Graph API is unavailable
 * - Comprehensive error handling and logging
 * - Support for both MSA and non-MSA credentials
 * - Interactive consent flow for applications requiring additional permissions
 *
 * Consent Flow:
 * When the application hasn't been granted consent for Microsoft Graph access,
 * the service automatically handles the consent process using popup authentication.
 * This prevents full page redirects and provides a smooth user experience.
 *
 * Error Handling:
 * - AADSTS65001 (consent required): Triggers interactive popup consent
 * - Network failures: Falls back to generated avatars
 * - Permission restrictions: Gracefully degrades to fallback options
 * - Popup blocking: Continues without Graph access using fallbacks
 */

import { Client } from "@microsoft/microsoft-graph-client";
import { PublicClientApplication, SilentRequest, AccountInfo } from "@azure/msal-browser";

/**
 * User information from Microsoft Graph API
 */
interface GraphUserInfo {
	displayName?: string;
	userPrincipalName?: string;
	id?: string;
}

/**
 * Creates a Microsoft Graph client using the provided access token
 */
function createGraphClient(accessToken: string): Client {
	return Client.init({
		authProvider: (done) => {
			done(null, accessToken);
		},
	});
}

/**
 * Fetches the user's profile picture from Microsoft Graph and returns it as a base64 data URL
 * Handles different account types (MSA, Azure AD, etc.) with appropriate fallbacks
 */
export async function getUserProfilePicture(accessToken: string): Promise<string | null> {
	try {
		const graphClient = createGraphClient(accessToken);

		// Try to get the user's profile photo metadata first to check if it exists
		try {
			const photoMetadata = await graphClient.api("/me/photo").get();

			// If we have metadata, try to get the actual photo
			if (photoMetadata && photoMetadata["@odata.mediaContentType"]) {
				const photoBlob = await graphClient.api("/me/photo/$value").get();

				if (photoBlob) {
					// Convert blob to base64
					const arrayBuffer = await photoBlob.arrayBuffer();
					const bytes = new Uint8Array(arrayBuffer);
					let binary = "";
					bytes.forEach((b) => (binary += String.fromCharCode(b)));
					const base64 = window.btoa(binary);

					// Use the content type from metadata or default to JPEG
					const contentType = photoMetadata["@odata.mediaContentType"] || "image/jpeg";
					return `data:${contentType};base64,${base64}`;
				}
			}
		} catch {
			// Try alternative approaches for different account types
			try {
				// For some Azure AD accounts, try getting user info to generate an avatar
				const userInfo = await graphClient
					.api("/me")
					.select("displayName,userPrincipalName,id")
					.get();

				// Generate a deterministic avatar using user info
				const avatarUrl = await generateUserAvatar(userInfo);
				if (avatarUrl) {
					return avatarUrl;
				}
			} catch {
				// User info unavailable
			}
		}

		return null;
	} catch (error) {
		console.warn("Failed to fetch user profile picture:", error);
		return null;
	}
}

/**
 * Generates a consistent avatar for the user using their information
 */
async function generateUserAvatar(userInfo: GraphUserInfo): Promise<string | null> {
	try {
		// Use the user's display name or email for generating avatar
		const name = userInfo.displayName || userInfo.userPrincipalName || userInfo.id;
		const userId = userInfo.id || userInfo.userPrincipalName;

		if (!name) {
			console.warn("No user information available for avatar generation");
			return null;
		}

		// Generate a consistent avatar based on user ID using DiceBear API
		// This creates a deterministic avatar that will be the same for the same user
		const seed = userId || name;
		const avatarStyle = "initials"; // Use initials style for professional look

		// Build the DiceBear API URL
		const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0d7bd6,a855f7,e11d48,f59e0b,10b981&radius=50&size=96`;

		// Fetch the SVG avatar from DiceBear API
		const response = await fetch(avatarUrl);
		if (response.ok) {
			const svgText = await response.text();
			// Convert SVG to data URL
			const base64Svg = window.btoa(svgText);
			return `data:image/svg+xml;base64,${base64Svg}`;
		}

		console.warn("Failed to generate avatar from DiceBear API");
		return null;
	} catch (error) {
		console.warn("Error generating user avatar:", error);
		return null;
	}
}

/**
 * Generates a fallback avatar when Microsoft Graph is not accessible
 * Uses the MSAL account information to create a consistent avatar
 */
export async function generateFallbackAvatar(account: AccountInfo): Promise<string | null> {
	try {
		// Use account information for avatar generation
		const name = account.name || account.username;
		const userId = account.homeAccountId || account.username;

		if (!name) {
			console.warn("No account information available for avatar generation");
			return null;
		}

		// Generate a consistent avatar based on account information
		const seed = userId || name;
		const avatarStyle = "initials"; // Use initials style for professional look

		// Build the DiceBear API URL
		const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0d7bd6,a855f7,e11d48,f59e0b,10b981&radius=50&size=96`;

		// Fetch the SVG avatar from DiceBear API
		const response = await fetch(avatarUrl);
		if (response.ok) {
			const svgText = await response.text();
			// Convert SVG to data URL
			const base64Svg = window.btoa(svgText);
			return `data:image/svg+xml;base64,${base64Svg}`;
		}

		console.warn("Failed to generate fallback avatar from DiceBear API");
		return null;
	} catch (error) {
		console.warn("Error generating fallback avatar:", error);
		return null;
	}
}

/**
 * Gets the Microsoft Graph access token from MSAL with appropriate scopes
 * Handles interactive consent when required
 */
export async function getGraphAccessToken(
	msalInstance: PublicClientApplication
): Promise<string | null> {
	try {
		const account = msalInstance.getActiveAccount();
		if (!account) {
			console.warn("No active account found");
			return null;
		}

		// Start with minimal scopes that are likely already consented
		const minimalRequest: SilentRequest = {
			scopes: ["User.Read"],
			account: account,
		};

		try {
			// Try with minimal scopes first
			const response = await msalInstance.acquireTokenSilent(minimalRequest);
			return response.accessToken;
		} catch (silentError: unknown) {
			// Check if this is an interaction required error
			const error = silentError as { errorCode?: string; name?: string }; // Type assertion for error checking
			if (
				error.errorCode === "InteractionRequiredAuthError" ||
				error.name === "InteractionRequiredAuthError" ||
				error.errorCode === "consent_required" ||
				error.errorCode === "interaction_required"
			) {
				// Show user-friendly message about consent
				console.log(
					"🔐 Microsoft Graph access requires additional permissions. A popup window will open for consent."
				);

				try {
					// Use popup for interactive consent to avoid full page redirect
					const interactiveResponse = await msalInstance.acquireTokenPopup({
						scopes: ["User.Read"],
						account: account,
						prompt: "consent",
					});

					return interactiveResponse.accessToken;
				} catch (popupError: unknown) {
					console.warn("Popup authentication failed:", popupError);

					// If popup fails (e.g., blocked), we'll continue without Graph access
					// The application should still work with fallback avatars
					return null;
				}
			} else {
				// For other types of errors, don't attempt interactive auth
				console.warn("Non-consent related error, skipping interactive auth:", error);
				return null;
			}
		}
	} catch (error) {
		console.error("Failed to get Graph access token:", error);
		return null;
	}
}

/**
 * Clears any cached tokens and forces re-authentication for Microsoft Graph
 * This can be useful when permissions change or consent is revoked
 */
export async function clearGraphTokenCache(msalInstance: PublicClientApplication): Promise<void> {
	try {
		const account = msalInstance.getActiveAccount();
		if (account) {
			// Remove cached tokens for Graph scopes
			await msalInstance.clearCache();
		}
	} catch (error) {
		console.warn("Failed to clear Graph token cache:", error);
	}
}

/**
 * Checks if the current account has consented to Microsoft Graph access
 */
export async function checkGraphConsent(msalInstance: PublicClientApplication): Promise<boolean> {
	try {
		const account = msalInstance.getActiveAccount();
		if (!account) return false;

		// Try to get a token silently - if this succeeds, consent is already given
		const silentRequest: SilentRequest = {
			scopes: ["User.Read"],
			account: account,
		};

		await msalInstance.acquireTokenSilent(silentRequest);
		return true;
	} catch {
		return false;
	}
}
