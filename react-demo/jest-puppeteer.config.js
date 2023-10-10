/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	launch: {
		slowMo: 300,
		headless: "new",
		devtools: false,
		args: ["--disable-setuid-sandbox", "--no-sandbox"],
	},
	server: {
		command: "npm start",
		port: 3000,
		launchTimeout: 100000,
		debug: true,
	},
};
