/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	transform: {
		"^.+\\.svelte$": "svelte-jester",
		"^.+\\.js$": "babel-jest",
	},
	moduleFileExtensions: ["js", "svelte"],
	testPathIgnorePatterns: ["node_modules"],
	bail: false,
	verbose: true,
	setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
};
