import type { AzureMember, ITokenProvider, ITokenResponse } from "@fluidframework/azure-client";
import axios from "axios";

export class AzureFunctionTokenProvider implements ITokenProvider {
	constructor(
		private readonly azFunctionUrl: string,
		private readonly user: Pick<AzureMember, "name" | "id" | "additionalDetails">
	) {}

	public async fetchOrdererToken(tenantId: string, documentId?: string): Promise<ITokenResponse> {
		return { jwt: await this.getToken(tenantId, documentId) };
	}

	public async fetchStorageToken(tenantId: string, documentId: string): Promise<ITokenResponse> {
		return { jwt: await this.getToken(tenantId, documentId) };
	}

	private async getToken(tenantId: string, documentId: string | undefined): Promise<string> {
		const response = await axios.get<unknown>(this.azFunctionUrl, {
			params: {
				tenantId,
				documentId,
				userName: this.user.name,
				userId: this.user.id,
				additionalDetails: this.user.additionalDetails,
			},
		});
		if (typeof response.data !== "string" || response.data.length === 0) {
			throw new Error("The Azure token endpoint did not return a token.");
		}
		return response.data;
	}
}
