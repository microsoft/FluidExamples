/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	preset: "jest-puppeteer",
	globals: {
		URL: "http://localhost:5173",
	},
	verbose: true,
	testTimeout: 30000,
	transform: {
		"^.+\\.tsx?$": "babel-jest",
	},
	reporters: ["jest-junit"],
};
