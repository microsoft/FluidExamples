/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SelectUser } from "./SelectUser";
import { AudienceDisplay } from "./AudienceDisplay";

export const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Routes>          
          <Route path="/" element={<SelectUser/>}>
          </Route>
          <Route path="/AudienceDisplay" element={<AudienceDisplay/>}>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};