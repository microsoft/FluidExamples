/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Polyfill for crypto.randomUUID() for older iOS Safari versions (< 15.4)
 * This ensures compatibility across all iOS devices
 */

// Check if crypto.randomUUID is available, if not provide a polyfill
if (typeof crypto !== "undefined" && !crypto.randomUUID) {
	// Add the polyfill to the crypto object
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(crypto as any).randomUUID = function (): string {
		// Generate a RFC 4122 version 4 compliant UUID
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	};
}

export {}; // Make this a module
