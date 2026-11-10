import { AzureClient } from "@fluidframework/azure-client";
import { loadApp } from "../AppLoad.js";
import { getClientProps } from "../infra/azure/azureClientProps.js";
import { AttachState } from "fluid-framework";
import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";
import { authHelper } from "../infra/auth.js";
import { getGraphAccessToken, getUserProfilePicture } from "../utils/graphService.js";
import { showErrorMessage } from "./ErrorMessage.js";

export async function azureStart() {
	try {
		// Get the user info
		const msalInstance: PublicClientApplication = await authHelper();

		// Handle the login redirect flows
		const tokenResponse = await msalInstance.handleRedirectPromise().catch((error: Error) => {
			console.log("Error in handleRedirectPromise: " + error.message);
			throw error; // Re-throw to be caught by outer try-catch
		});

		// If the tokenResponse is not null, then the user is signed in
		// and the tokenResponse is the result of the redirect.
		if (tokenResponse !== null && tokenResponse !== undefined) {
			// Use the account from the token response to ensure we have the correct one
			const account = tokenResponse.account || msalInstance.getAllAccounts()[0];
			if (account) {
				signedInAzureStart(msalInstance, account);
			} else {
				// Fallback if no account in response
				msalInstance.loginRedirect();
			}
		} else {
			const currentAccounts = msalInstance.getAllAccounts();
			// If there are no accounts, the user is not signed in.
			if (currentAccounts === null || currentAccounts.length === 0) {
				msalInstance.loginRedirect();
			} else if (currentAccounts.length === 1) {
				// Single account, use it directly
				const account = currentAccounts[0];
				signedInAzureStart(msalInstance, account);
			} else {
				// Multiple accounts, check if there's an active account
				const activeAccount = msalInstance.getActiveAccount();
				if (activeAccount) {
					// Use the active account if one is set
					signedInAzureStart(msalInstance, activeAccount);
				} else {
					// No active account, show account selector
					await showAccountSelector(msalInstance, currentAccounts);
				}
			}
		}
	} catch (error) {
		console.error("Error starting Azure Fluid demo:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		showErrorMessage(
			"Failed to load Fluid Demo with Azure authentication",
			"Error details: " + errorMessage,
			"Please check your internet connection and try refreshing the page."
		);
	}
}

async function showAccountSelector(
	msalInstance: PublicClientApplication,
	accounts: AccountInfo[]
): Promise<void> {
	// Create account selection UI with improved messaging
	return new Promise((resolve) => {
		// Create account list message
		let message = "Multiple Microsoft accounts are available. Please choose:\n\n";
		accounts.forEach((account, index) => {
			const displayName = account.name || account.username;
			const email = account.username;
			message += `${index + 1}. ${displayName}`;
			if (displayName !== email) {
				message += ` (${email})`;
			}
			message += "\n";
		});
		message += `\n${accounts.length + 1}. Sign in with a different account\n`;
		message += `${accounts.length + 2}. Cancel`;

		// Show prompt with better instruction
		const choice = prompt(message + "\n\nEnter your choice (1-" + (accounts.length + 2) + "):");

		if (!choice) {
			// User cancelled - use the first account as fallback
			signedInAzureStart(msalInstance, accounts[0]);
			resolve();
			return;
		}

		const choiceNum = parseInt(choice);

		if (choiceNum >= 1 && choiceNum <= accounts.length) {
			// User selected an existing account
			const selectedAccount = accounts[choiceNum - 1];
			signedInAzureStart(msalInstance, selectedAccount);
		} else if (choiceNum === accounts.length + 1) {
			// User wants to use a different account
			msalInstance.loginRedirect({
				prompt: "login",
				scopes: ["openid", "profile", "email"],
			});
		} else {
			// Invalid choice or cancel - use the first account as fallback
			signedInAzureStart(msalInstance, accounts[0]);
		}

		resolve();
	});
}

async function signedInAzureStart(msalInstance: PublicClientApplication, account: AccountInfo) {
	try {
		// Set the active account
		msalInstance.setActiveAccount(account);

		// Fetch the user's profile picture with improved fallback handling
		let profilePicture = null;

		// Try to get access token and fetch profile picture from Microsoft Graph
		const accessToken = await getGraphAccessToken(msalInstance);
		if (accessToken) {
			profilePicture = await getUserProfilePicture(accessToken);
		}

		// Create the azureUser from the account
		const user = {
			name: account.name ?? account.username,
			id: account.homeAccountId,
			image: profilePicture || undefined,
		};

		// Get the root container id from the URL
		// The id is a parameter on the url
		const urlParams = new URLSearchParams(window.location.search);
		let containerId = urlParams.get("id") ?? "";

		// Initialize Devtools logger if in development mode
		const logger = undefined;
		// Commented out to suppress FluidDevToolsLogger console messages
		// if (process.env.NODE_ENV === "development") {
		// 	const { createDevtoolsLogger } = await import("@fluidframework/devtools/beta");
		// 	logger = createDevtoolsLogger();
		// }

		// Initialize the Azure client
		const clientProps = getClientProps(user, logger);
		const client = new AzureClient(clientProps);

		// Load the app
		const container = await loadApp({ client, containerId, account, user, msalInstance });

		// If the app is in a `createNew` state - no containerId, and the container is detached, we attach the container.
		// This uploads the container to the service and connects to the collaboration session.
		if (container.attachState === AttachState.Detached) {
			containerId = await container.attach();
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set("id", containerId);
			window.history.replaceState({}, "", newUrl.toString());
		}
	} catch (error) {
		console.error("Error loading Fluid app with Azure authentication:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		showErrorMessage(
			"Failed to initialize Fluid Framework application",
			"Error details: " + errorMessage,
			"Please ensure you have a stable internet connection and try refreshing the page."
		);
	}
}
