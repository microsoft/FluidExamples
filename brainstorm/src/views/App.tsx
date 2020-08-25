/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Switch, Route, Link } from "react-router-dom";

import {
  CreateNewFluidContainer,
  LoadFluidContainer,
} from "./LoadFluidContainer";
import { Home } from "./Home";

// eslint-disable-next-line import/no-unassigned-import
import "../styles.scss";

export const App = () => {
  return (
    <div style={{ marginLeft: 5, marginRight: 5 }}>
      <nav className="nav-wrapper">
        <span className="nav-title">Brainstorm</span>
        <span className="vertical-center">
          <Link to="/">Home</Link>
          <span> | </span>
          <Link to="/about">About</Link>
        </span>
      </nav>

      <Switch>
        <Route path="/about">
          <div className="content-wrapper">
            <h3>About</h3>
            <p>Brainstorm is about collecting awesome ideas</p>
          </div>
        </Route>
        <Route path="/createNew/:id">
          <div className="content-wrapper">
            <LoadFluidContainer new />
          </div>
        </Route>
        <Route path="/:id">
          <div className="content-wrapper">
            <LoadFluidContainer />
          </div>
        </Route>
        <Route path="/">
          <div className="content-wrapper">
            <Home />
          </div>
        </Route>
      </Switch>
    </div>
  );
};
