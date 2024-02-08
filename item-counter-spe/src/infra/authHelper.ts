import { PublicClientApplication } from "@azure/msal-browser";

export async function authHelper() {
	const clientId = process.env.SPE_CLIENT_ID;

	if (!clientId) {
		throw new Error("SPE_CLIENT_ID is not defined");
	}

	const msalConfig = {
		auth: {
			clientId,
			authority: "https://login.microsoftonline.com/common/",
			tenantId: "common",
		},
	};

	const msalInstance = new PublicClientApplication(msalConfig);
	await msalInstance.initialize();

	return msalInstance;
}
