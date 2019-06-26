const getArgNames = require('./getArgNames');
const hasKey = require('./hasKey');

function getArgs(fn, values, specialCb) {
    const argNames = getArgNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!hasKey(values, arg) && specialCb) {
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
