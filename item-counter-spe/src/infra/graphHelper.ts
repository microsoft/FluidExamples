import { PublicClientApplication, InteractionType, AccountInfo } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import {
	AuthCodeMSALBrowserAuthenticationProvider,
	AuthCodeMSALBrowserAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { Site } from "@microsoft/microsoft-graph-types";

export interface FileStorageContainer {
	containerTypeId: string;
	createdDateTime: string;
	displayName: string;
	id: string;
}

export class GraphHelper {
	private readonly intializedPublicClientApplication: PublicClientApplication;
	private readonly accountInfo: AccountInfo;
	private readonly graphClient: Client;
	constructor(publicClientApplication: PublicClientApplication, accountInfo: AccountInfo) {
		this.intializedPublicClientApplication = publicClientApplication;
		this.accountInfo = accountInfo;

		const options: AuthCodeMSALBrowserAuthenticationProviderOptions = {
			account: this.accountInfo, // the AccountInfo instance to acquire the token for.
			interactionType: InteractionType.Redirect, // msal-browser InteractionType
			scopes: ["user.read"], // scopes to be passed
		};

		const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
			this.intializedPublicClientApplication,
			options,
		);

		// Initialize the Graph client
		this.graphClient = Client.initWithMiddleware({
			authProvider,
		});
	}

	public async getFileStorageContainerId(): Promise<string> {
		const containerTypeId = process.env.SPE_CONTAINER_TYPE_ID;

		if (!containerTypeId) {
			throw new Error("SPE_CONTAINER_TYPE_ID is not defined");
		}

		const response = await this.graphClient
			.api("/storage/fileStorage/containers")
			.filter("containerTypeId eq " + containerTypeId)
			.version("beta")
			.get();

		const fileStorageContainers: FileStorageContainer[] = response.value;

		if (fileStorageContainers.length == 0) {
			console.log("TEST: no fileStorageContainers");
		}

		return fileStorageContainers[0].id;
	}

	public async getSiteUrl(): Promise<string> {
		const response = await this.graphClient
			.api("/sites")
			.version("beta")
			.filter("siteCollection/root ne null")
			.select("siteCollection,webUrl")
			.get();

		const sites: Site[] = response.value;

		return sites[0].webUrl as string;
	}
}
