/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

import { useParams, useHistory } from "react-router-dom";

import { FluidContext } from "../utils/FluidContext";
import { FluidDraftJsView } from "../view/FluidDraftJsView";
import { useDraftJsData } from "../utils";

export const DraftJsPage = (props: { new?: boolean }) => {
  const { id } = useParams<{id}>();
  const history = useHistory();

  if (props.new) {
    history.replace(`/${id}`);
  }

  const context = useDraftJsData(id, props.new);

  return context ? (
    <FluidContext.Provider value={context}>
      <FluidDraftJsView />
    </FluidContext.Provider>
  ) : (
    <></>
  );
};
