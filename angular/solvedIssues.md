# Had to do the following to get Fluid going in Angular

Add the following into the `package.json` scripts:

`"postinstall": "node patch-webpack.js"`

Add the following script to the root of an Angular project. Name it `patch-webpack.js`.

```javascript
const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

fs.readFile(f, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    let result = data.replace(/node: false/g, "node: { crypto: true, stream: true, assert: true }");
    
    fs.writeFile(f, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});
```

More details about why this is being done can be found at https://blog.lysender.com/2018/07/angular-6-cannot-resolve-crypto-fs-net-path-stream-when-building-angular/

Tried doing this in package.json but never got it to work:

```javascript
"browser": {
    "crypto": false,
    "stream": false,
    "assert": false
}
```

