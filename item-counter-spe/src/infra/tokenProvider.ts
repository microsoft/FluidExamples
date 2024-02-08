import {
	AuthenticationResult,
    InteractionRequiredAuthError,
    PublicClientApplication,
} from '@azure/msal-browser';
import { IOdspTokenProvider } from '@fluid-experimental/odsp-client';
import { TokenResponse } from '@fluidframework/odsp-driver-definitions';

export class OdspTestTokenProvider implements IOdspTokenProvider {
    private readonly intializedPublicClientApplication: PublicClientApplication;
    constructor(publicClientApplication: PublicClientApplication) {
        this.intializedPublicClientApplication = publicClientApplication;
    }

    public async fetchWebsocketToken(        
    ): Promise<TokenResponse> {
        const pushScope = [
            'offline_access https://pushchannel.1drv.ms/PushChannel.ReadWrite.All',
        ];
        const token = await this.fetchTokens(pushScope);
        return {
            fromCache: true,
            token,
        };
    }

    public async fetchStorageToken(
        siteUrl: string,        
    ): Promise<TokenResponse> {
        const storageScope = [`${siteUrl}/Container.Selected`];

        const token = await this.fetchTokens(storageScope);

        return {
            fromCache: true,
            token,
        };
    }

    private async fetchTokens(scope: string[]): Promise<string> {
		let response: AuthenticationResult;
        try {
            response = await this.intializedPublicClientApplication
                .acquireTokenSilent({ scopes: scope })                
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                response = await this.intializedPublicClientApplication.acquireTokenPopup({ scopes: scope })                    
            } else {
				throw new Error(`MSAL error: ${error}`);
			}
        }
		return response.accessToken;
    }
}
