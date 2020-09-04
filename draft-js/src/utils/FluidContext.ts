/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { IFluidDraftJsObject } from "../fluid-object";

/**
 * Having a React Context allows the INoteroDataModel object to be passed through
 * without using props.
 *
 * This is faking a default to make TypeScript happy. This context will not work
 * if not initialized with a real object.
 */
export const FluidContext = React.createContext({} as unknown as IFluidDraftJsObject);
