import { IOdspTokenProvider, OdspClientProps } from "@fluid-experimental/odsp-client";
import { createDevtoolsLogger } from "@fluidframework/devtools";

// Instantiate the logger
export const devtoolsLogger = createDevtoolsLogger();

// Create the client props for the Fluid client
export const getClientProps = (
	siteUrl: string,
	driveId: string,
	tokenProvider: IOdspTokenProvider,
): OdspClientProps => {
	const connectionConfig = {
		tokenProvider: tokenProvider,
		siteUrl: siteUrl,
		driveId: driveId,
	};

	return {
		connection: connectionConfig,
	};
};
