/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

process.env.JEST_PUPPETEER_CONFIG = require.resolve("./jest-puppeteer.config.cjs");

module.exports = {
    preset: "jest-puppeteer",
    globals: {
        URL: "http://localhost:3000",
    },
    verbose: true,
};
