const package = require('package');

// electron app requires chalk@^2.0.0
const chalk = require('chalk');

console.log('Electron App has chalk version 2: ', typeof chalk`` === 'function');
console.log('Electron App dependency: package has chalk version 1: ', package.hasChalkVersion1());