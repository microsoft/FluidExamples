/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
    launch: {
        slowMo: 300,
        headless: true,
        devtools: false,
        args: ["--disable-setuid-sandbox", "--no-sandbox"],
    },
    server: {
        command: "npm run start:client",
        port: 8080,
        launchTimeout: 100000,
        debug: true,
    },
};
