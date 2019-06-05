const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getArgsNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

function bindArgs(fn, values, specialCb) {
    const argNames = getArgsNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!values.hasOwnProperty(arg)) {
            args.push(specialCb.call(null, ...[fn, arg]));
        }
    }

    return args;
}

module.exports = bindArgs;