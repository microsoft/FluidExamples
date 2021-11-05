/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/helloWorldTab/index.html")
@PreventIframe("/helloWorldTab/config.html")
@PreventIframe("/helloWorldTab/remove.html")
export class HelloWorldTab {
}
