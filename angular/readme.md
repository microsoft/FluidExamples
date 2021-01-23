# Fluid Framework Angular Examples Repository

This codebase includes examples of collaborative applications built with the Fluid Framework and Angular. For documentation about the Fluid Framework, go to https://FluidFramework.com. The Fluid Framework repository lives at https://github.com/Microsoft/FluidFramework.

Each example is a standalone application that defines a Fluid Container and loads it into a webpage. To get started, clone the repo, go into a
example folder that you want to run, and follow the instructions in the example's `readme.md` file.

If you're using VS Code and don't already have the [Angular Language service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template&WT.mc_id=m365-0000-dwahlin) we recommend installing it.

## NOTE

Fluid is isomorphic and currently relies on Node objects such as crypto. As a result you'll see a postinstall script in the package.json file that modifies the build. The file paths that are patched depend on your version of Angular so you may have to open the `patch-webpack.js` and modify it if you're using Angular 11+ (this example is using Angular 10).

**Angular 11+**     `const f = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';`
**Angular < 11**    `const f ='node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js';`

