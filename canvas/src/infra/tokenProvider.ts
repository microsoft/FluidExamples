/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { AzureMember, ITokenProvider, ITokenResponse, IUser } from "@fluidframework/azure-client";
import { ScopeType } from "@fluidframework/protocol-definitions";
import axios from "axios";
import { KJUR as jsrsasign } from "jsrsasign";
import { v4 as uuid } from "uuid";

/**
 * Token Provider implementation for connecting to an Azure Function endpoint for
 * Azure Fluid Relay token resolution.
 */
export class AzureFunctionTokenProvider implements ITokenProvider {
	/**
	 * Creates a new instance using configuration parameters.
	 * @param azFunctionUrl - URL to Azure Function endpoint
	 * @param user - User object
	 */
	constructor(
		private readonly azFunctionUrl: string,
		private readonly user?: Pick<AzureMember, "name" | "id" | "additionalDetails">
	) {}

	public async fetchOrdererToken(documentId?: string): Promise<ITokenResponse> {
		return {
			jwt: await this.getToken(documentId),
		};
	}

	public async fetchStorageToken(tenantId: string, documentId: string): Promise<ITokenResponse> {
		return {
			jwt: await this.getToken(documentId),
		};
	}

	private async getToken(documentId: string | undefined): Promise<string> {
		const response = await axios.get(this.azFunctionUrl, {
			params: {
				documentId,
				userName: this.user?.name,
				userId: this.user?.id,
				additionalDetails: this.user?.additionalDetails,
			},
		});
		return response.data as string;
	}
}

/**
 * Generates a {@link https://en.wikipedia.org/wiki/JSON_Web_Token | JSON Web Token} (JWT)
 * to authorize access to a Routerlicious-based Fluid service.
 *
 * @remarks Note: this function uses a browser friendly auth library
 * ({@link https://www.npmjs.com/package/jsrsasign | jsrsasign}) and may only be used in client (browser) context.
 * It is **not** Node.js-compatible.
 *
 * @param tenantId - See {@link @fluidframework/protocol-definitions#ITokenClaims.tenantId}
 * @param key - API key to authenticate user. Must be {@link https://en.wikipedia.org/wiki/UTF-8 | UTF-8}-encoded.
 * @param scopes - See {@link @fluidframework/protocol-definitions#ITokenClaims.scopes}
 * @param documentId - See {@link @fluidframework/protocol-definitions#ITokenClaims.documentId}.
 * If not specified, the token will not be associated with a document, and an empty string will be used.
 * @param user - User with whom generated tokens will be associated.
 * If not specified, the token will not be associated with a user, and a randomly generated mock user will be
 * used instead.
 * See {@link @fluidframework/protocol-definitions#ITokenClaims.user}
 * @param lifetime - Used to generate the {@link @fluidframework/protocol-definitions#ITokenClaims.exp | expiration}.
 * Expiration = now + lifetime.
 * Expressed in seconds.
 * Default: 3600 (1 hour).
 * @param ver - See {@link @fluidframework/protocol-definitions#ITokenClaims.ver}.
 * Default: `1.0`.
 */
export function generateToken(
	tenantId: string,
	key: string,
	scopes: ScopeType[],
	user: IUser,
	documentId?: string,
	lifetime: number = 60 * 60,
	ver = "1.0"
): string {
	const userClaim = user;

	// Current time in seconds
	const now = Math.round(Date.now() / 1000);
	const docId = documentId ?? "";

	const claims = {
		documentId: docId,
		scopes,
		tenantId,
		user: userClaim,
		iat: now,
		exp: now + lifetime,
		ver,
		jti: uuid(),
	};

	const utf8Key = { utf8: key };
	return jsrsasign.jws.JWS.sign(
		null,
		JSON.stringify({ alg: "HS256", typ: "JWT" }),
		claims,
		utf8Key
	);
}
