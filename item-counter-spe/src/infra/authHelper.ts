import { PublicClientApplication } from "@azure/msal-browser";

// Helper function to authenticate the user
export async function authHelper(): Promise<PublicClientApplication> {
	// Get the client id (app id) from the environment variables
	const clientId = process.env.SPE_CLIENT_ID;

	if (!clientId) {
		throw new Error("SPE_CLIENT_ID is not defined");
	}

	const tenantId = process.env.SPE_ENTRA_TENANT_ID;
	if (!tenantId) {
		throw new Error("SPE_ENTRA_TENANT_ID is not defined");
	}

	// Create the MSAL instance
	const msalConfig = {
		auth: {
			clientId,
			authority: `https://login.microsoftonline.com/${tenantId}/`,
			tenantId,
		},
	};

	// Initialize the MSAL instance
	const msalInstance = new PublicClientApplication(msalConfig);
	await msalInstance.initialize();

	return msalInstance;
}
