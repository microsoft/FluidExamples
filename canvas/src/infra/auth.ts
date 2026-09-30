import { PublicClientApplication } from "@azure/msal-browser";

// Helper function to authenticate the user
export async function authHelper(): Promise<PublicClientApplication> {
	// Get the client id (app id) from the environment variables
	const clientId = process.env.AZURE_CLIENT_ID;
	const redirectUri = process.env.AZURE_REDIRECT_URI;
	const fluidClient = process.env.FLUID_CLIENT;

	if (!clientId) {
		throw new Error("AZURE_CLIENT_ID is not defined");
	}

	if (!redirectUri) {
		throw new Error("AZURE_REDIRECT_URI is not defined");
	}

	if (!fluidClient) {
		throw new Error("FLUID_CLIENT is not defined");
	}

	// Create the MSAL instance
	const msalConfig = {
		auth: {
			clientId,
			redirectUri,
			authority: "https://login.microsoftonline.com/common/",
		},
		cache: {
			cacheLocation: "localStorage",
		},
	};

	// Initialize the MSAL instance
	const msalInstance = new PublicClientApplication(msalConfig);
	await msalInstance.initialize();

	return msalInstance;
}

// Helper function to sign out the user
export async function signOutHelper(msalInstance: PublicClientApplication): Promise<void> {
	try {
		// Get the active account
		const account = msalInstance.getActiveAccount();

		if (account) {
			// Logout with redirect to ensure proper cleanup
			await msalInstance.logoutRedirect({
				account: account,
				postLogoutRedirectUri: window.location.origin,
			});
		} else {
			// If no active account, just redirect to the main page
			window.location.href = window.location.origin;
		}
	} catch (error) {
		console.error("Sign out failed:", error);
		// Fallback: clear local storage and redirect
		localStorage.clear();
		window.location.href = window.location.origin;
	}
}

/**
 * Helper function to switch to a different Microsoft account.
 * This function will show the account selection UI and allow the user to
 * either pick a different cached account or sign in with a new account.
 *
 * @param msalInstance - The MSAL instance
 * @returns Promise that resolves when account switching is complete
 */
export async function switchAccountHelper(msalInstance: PublicClientApplication): Promise<void> {
	try {
		// Get all cached accounts
		const allAccounts = msalInstance.getAllAccounts();

		if (allAccounts.length > 1) {
			// Multiple accounts available, trigger account selection
			// Clear the active account to force account selection
			msalInstance.setActiveAccount(null);

			// Redirect to login with account selection prompt
			await msalInstance.loginRedirect({
				prompt: "select_account",
				scopes: ["openid", "profile", "email"],
			});
		} else {
			// Only one or no accounts, force a new login
			await msalInstance.loginRedirect({
				prompt: "login",
				scopes: ["openid", "profile", "email"],
			});
		}
	} catch (error) {
		console.error("Account switching failed:", error);
		// Fallback: try a simple login redirect
		await msalInstance.loginRedirect({
			prompt: "select_account",
			scopes: ["openid", "profile", "email"],
		});
	}
}
