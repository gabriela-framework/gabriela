var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function createGenerator(tasks) {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < tasks.length)) return [3, 4];
                return [4, tasks[i]];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3, 1];
            case 4: return [2];
        }
    });
}
function ucFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function is(type, val) {
    var res = "[object " + ucFirst(type) + "]";
    if (type === "float") {
        return val === +val && val !== (val | 0);
    }
    if (type === 'generator') {
        return /\[object Generator|GeneratorFunction\]/.test(Object.prototype.toString.call(val));
    }
    if (type.toLowerCase() === "nan") {
        return val !== val;
    }
    return Object.prototype.toString.call(val) === res;
}
function isAsyncFn(val) {
    if (!val)
        return false;
    if (!val.constructor)
        return false;
    return val.constructor.name === 'AsyncFunction';
}
function inArray(array1, array2) {
    for (var _i = 0, array1_1 = array1; _i < array1_1.length; _i++) {
        var entry = array1_1[_i];
        if (array2.includes(entry))
            return true;
    }
    return false;
}
function wait(cb) {
    return new Promise(function (resolve) {
        var check = function () {
            var res = cb();
            if (res.success) {
                return resolve(res.value);
            }
            setTimeout(check, 0);
        };
        setTimeout(check, 0);
    });
}
function hasKey(obj, key) {
    if (!is('object', obj))
        return false;
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function getArgNames(func) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) {
        result = [];
    }
    return result;
}
function getArgs(fn, values) {
    var argNames = getArgNames(fn);
    var args = [];
    for (var _i = 0, argNames_1 = argNames; _i < argNames_1.length; _i++) {
        var arg = argNames_1[_i];
        if (!is('object', values)) {
            args.push({
                name: arg,
                value: null
            });
        }
        else {
            args.push({
                name: arg,
                value: values[arg]
            });
        }
    }
    return args;
}
var IIterator = (function () {
    function IIterator() {
    }
    IIterator.prototype[Symbol.iterator] = function () {
        var entries, _i, entries_1, entry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entries = Object.values(this);
                    _i = 0, entries_1 = entries;
                    _a.label = 1;
                case 1:
                    if (!(_i < entries_1.length)) return [3, 4];
                    entry = entries_1[_i];
                    return [4, entry];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3, 1];
                case 4: return [2];
            }
        });
    };
    ;
    IIterator.prototype.toArray = function () {
        return Object.values(this);
    };
    return IIterator;
}());
function isEnvExpression(expression) {
    var REGEX = /env\(\'\w+\'\)/i;
    return REGEX.test(expression);
}
function extractEnvExpression(expression) {
    var REGEX = /env\(\'(\w+)\'\)/i;
    var result = expression.match(REGEX);
    if (!result)
        return null;
    return result[1];
}
function isIterable(value) {
    if (!is('object', value) && !Array.isArray(value))
        return false;
    if (is('function', value[Symbol.iterator]))
        return true;
    return !!is('object', value);
}
function _getType(value) {
    if (value === null)
        return 'null';
    if (is('object', value))
        return 'object';
    if (Array.isArray(value))
        return 'array';
    if (is('bool', value))
        return 'bool';
    if (is('string', value))
        return 'string';
}
function mutate(value, valueKey, entry, reactTo, mutator) {
    var type = _getType(entry);
    if (type === 'object' || type === 'array') {
        if (reactTo.includes('object') || reactTo.includes('array'))
            return mutator.call(null, entry);
    }
    if (type !== 'object' && type !== 'array') {
        if (reactTo.includes('string') ||
            reactTo.includes('null') ||
            reactTo.includes('bool')) {
            var mutation = mutator.call(null, entry);
            value[valueKey] = mutation;
        }
    }
}
function iterate(value, reactionOptions) {
    if (!isIterable(value))
        return false;
    if (!is('object', reactionOptions))
        throw new Error("Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function");
    if (!is('array', reactionOptions.reactTo))
        throw new Error("Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function");
    var validReactions = ['string', 'array', 'object', 'bool', 'null'];
    for (var _i = 0, _a = reactionOptions.reactTo; _i < _a.length; _i++) {
        var reaction = _a[_i];
        if (!validReactions.includes(reaction))
            throw new Error("Invalid options type supplied to 'iterate'. options.reactTo must be one of '" + validReactions.join(', ') + "'");
    }
    if (!is('function', reactionOptions.reactor))
        throw new Error("Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function");
    var realIterator = function (value, reactionOptions) {
        if (is('object', value)) {
            for (var key in value) {
                var realEntry = value[key];
                mutate(value, key, realEntry, reactionOptions.reactTo, reactionOptions.reactor);
                if (isIterable(value))
                    realIterator(realEntry, reactionOptions);
            }
        }
    };
    realIterator(value, reactionOptions);
}
module.exports = {
    createGenerator: createGenerator,
    getArgNames: getArgNames,
    getArgs: getArgs,
    hasKey: hasKey,
    inArray: inArray,
    is: is,
    isAsyncFn: isAsyncFn,
    ucFirst: ucFirst,
    wait: wait,
    IIterator: IIterator,
    isEnvExpression: isEnvExpression,
    extractEnvExpression: extractEnvExpression,
    isIterable: isIterable,
    iterate: iterate
};
//# sourceMappingURL=util.js.map