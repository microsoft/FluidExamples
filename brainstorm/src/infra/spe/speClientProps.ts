import type { ITelemetryBaseLogger } from "@fluidframework/core-interfaces";
import type { IOdspTokenProvider, OdspClientProps } from "@fluidframework/odsp-client/beta";

// Create the client props for the Fluid client
export const getClientProps = (
	siteUrl: string,
	driveId: string,
	tokenProvider: IOdspTokenProvider,
	logger?: ITelemetryBaseLogger,
): OdspClientProps => {
	const connectionConfig = {
		tokenProvider,
		siteUrl,
		driveId,
		filePath: "",
	};

	return {
		connection: connectionConfig,
		logger,
	};
};
