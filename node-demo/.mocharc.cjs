/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	reporter: "mocha-junit-reporter",
	reporterOptions: ["mochaFile=./nyc/mocha-junit-report.xml"],
	timeout: 20000,
};
