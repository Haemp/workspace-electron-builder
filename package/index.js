// package requires chalk@^1.0.0
var chalk = require('chalk');

modules.export.hasChalkVersion1 = () => {
    // check to make sure version 1
    // dependent code can run.
    // chalk 2 doesn't have .hasColor()
    return typeof chalk.hasColor === 'function';
}