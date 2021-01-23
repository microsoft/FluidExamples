# Had to do the following to get Fluid going in Angular

Update: https://blog.lysender.com/2018/07/angular-6-cannot-resolve-crypto-fs-net-path-stream-when-building-angular/

- Add the following

    1. "postinstall": "node patch-webpack.js" (package.json)
    2. Following script:

    ```javascript
    const fs = require('fs');
    const f = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';
    
    fs.readFile(f, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        let result = data.replace(/node: false/g, "node: { crypto: true, stream: true, fs: 'empty', net: 'empty', assert: true }");
        
        fs.writeFile(f, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
    ```

