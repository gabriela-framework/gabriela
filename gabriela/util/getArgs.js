const getArgNames = require('./getArgNames');

function getArgs(fn, values, specialCb) {
    const argNames = getArgNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!values.hasOwnProperty(arg) && specialCb) {
            args.push({
                name: 'special',
                value: specialCb.call(null, ...[arg]),
            });
        } else {
            args.push({
                name: arg,
                value: values[arg],
            });
        }
    }

    return args;
}

module.exports = getArgs;
