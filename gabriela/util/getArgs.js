const getArgNames = require('./getArgNames');

function getArgs(fn, values, specialCb) {
    const argNames = getArgNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!values.hasOwnProperty(arg)) {
            args.push(specialCb.call(null, ...[arg]));
        } else {
            args.push(values[arg]);
        }
    }

    return args;
}

module.exports = getArgs;
