/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { initializeIcons, ThemeProvider } from '@fluentui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './view/App.css';
import './view/index.css';
import { themeNameToTheme } from './Themes';

export async function start() {
  initializeIcons();

  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={themeNameToTheme('default')}>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
}

start().catch((error) => console.error(error));
