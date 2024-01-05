/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as config from "../jest.config";

let url;

describe("item-counter", () => {
    const load = async () => {
        await page.goto(config.globals.URL, {
            waitUntil: ["networkidle2", "load"],
            timeout: 10000,
        });
    };

    beforeEach(async () => {
        await load();
        expect(await page.title()).toBe("Fluid Demo");
        url = await page.url();
    });

    it("Load the container", async () => {
        console.log("Container URL---", url);
        await page.goto(url, { waitUntil: "domcontentloaded" });
    });
});
