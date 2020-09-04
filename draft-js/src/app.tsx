/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Switch, Route, Link } from "react-router-dom";

import { Home, BrainstormPage } from "./pages";

// eslint-disable-next-line import/no-unassigned-import
import "./styles.scss";

const App = () => {
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
            <BrainstormPage new />
          </div>
        </Route>
        <Route path="/:id">
          <div className="content-wrapper">
            <BrainstormPage />
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

// Render the content using ReactDOM
ReactDOM.render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById("content")
);
