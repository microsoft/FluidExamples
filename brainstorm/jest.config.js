/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	preset: "jest-puppeteer",
	globals: {
		URL: "http://localhost:3000",
	},
	verbose: true,
	testTimeout: 100000,
	transform: {
		"^.+\\.tsx?$": "babel-jest",
	},
};
