const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getArgsNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

function getArgs(fn, values, specialCb) {
    const argNames = getArgsNames(fn);

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