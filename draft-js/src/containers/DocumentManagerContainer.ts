/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ContainerRuntimeFactoryWithDefaultDataStore } from "@fluid-experimental/experimental-fluidframework";

import { DocumentManager } from "../fluid-object";

/**
 * This does setup for the Fluid Container.
 *
 * There are two important things here:
 * 1. Default FluidObject name
 * 2. Map of string to factory for all FluidObjects
 *
 * In this example, we are only registering a single FluidObject, but more complex examples will register multiple
 * FluidObjects.
 */
export const DocumentManagerContainer = new ContainerRuntimeFactoryWithDefaultDataStore(
    DocumentManager.factory,
    new Map([DocumentManager.factory.registryEntry]),
);
