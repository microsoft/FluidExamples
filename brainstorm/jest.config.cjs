/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	preset: "jest-puppeteer",
	globals: {
		URL: "http://localhost:8080",
	},
	verbose: true,
	testTimeout: 60000,
	transform: {
		"^.+\\.jsx?$": "babel-jest",
	},
	reporters: ["jest-junit"],
};
