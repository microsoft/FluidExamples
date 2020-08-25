/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import React from "react";

import { useParams, useHistory } from "react-router-dom";

import { FluidContext } from "../utils/FluidContext";
import { NoteroView } from "../partials/NoteroView";
import { useBrainstormData } from "../utils";

export const BrainstormPage = (props: { new?: boolean }) => {
  const { id } = useParams();
  const history = useHistory();

  if (props.new) {
    history.replace(`/${id}`);
  }

  const context = useBrainstormData(id, props.new);

  return context ? (
    <FluidContext.Provider value={context}>
      <NoteroView />
    </FluidContext.Provider>
  ) : (
    <></>
  );
};
