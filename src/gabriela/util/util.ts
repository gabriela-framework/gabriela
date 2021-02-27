function* createGenerator (tasks) {
    for (let i = 0; i < tasks.length; i++) {
        yield tasks[i];
    }
}

function ucFirst (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function is(type, val) {
    const res = `[object ${ucFirst(type)}]`;

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
    if (!val) return false;

    if (!val.constructor) return false;

    return val.constructor.name === 'AsyncFunction';
}

function inArray(array1, array2) {
    for (const entry of array1) {
        if (array2.includes(entry)) return true;
    }

    return false;
}

function wait(cb) {
    return new Promise((resolve)=> {
        const check = () => {
            const res = cb();

            if (res.success) {
                return resolve(res.value);
            }

            setTimeout(check, 0);
        };

        setTimeout(check, 0);
    });
}

function hasKey(obj, key) {
    if (!is('object', obj)) return false;
    
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function getArgNames(func) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;

    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

    if(result === null) {
        result = [];
    }

    return result;
}

function getArgs(fn, values) {
    const argNames = getArgNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!is('object', values)) {
            args.push({
                name: arg,
                value: null,
            });
        }else {
            args.push({
                name: arg,
                value: values[arg],
            });
        }
    }

    return args;
}

class IIterator {
    *[Symbol.iterator]() {
        const entries = Object.values(this);

        for (const entry of entries) {
            yield entry;
        }
    };

    toArray() {
        return Object.values(this);
    }
}

function isEnvExpression(expression) {
    const REGEX = /env\(\'\w+\'\)/i;

    return REGEX.test(expression);
}

function extractEnvExpression(expression) {
    const REGEX = /env\(\'(\w+)\'\)/i;

    const result = expression.match(REGEX);

    if (!result) return null;

    return result[1];
}

/**
 * Returns true only for iterator objects and array, not string since strings can be iterated also
 * @param value
 * @returns {boolean}
 */
function isIterable(value) {
    if (!is('object', value) && !Array.isArray(value)) return false;

    if (is('function', value[Symbol.iterator])) return true;

    return !!is('object', value);
}

/**
 * Private to iterate(). Only used in iterate(). Do not use anywhere else
 * @param value
 * @returns {string}
 * @private
 */
function _getType(value) {
    if (value === null) return 'null';
    if (is('object', value)) return 'object';
    if (Array.isArray(value)) return 'array';
    if (is('bool', value)) return 'bool';
    if (is('string', value)) return 'string';
}

/**
 * Private to iterate(). Only used in iterate(). Do not use anywhere else
 * @param value
 * @returns {string}
 * @private
 */
function mutate(value, valueKey, entry, reactTo, mutator) {
    const type = _getType(entry);
    // if reaction type is an object or an array, reactor function is responsible
    // for the reaction and value change since both are references are
    // i don't want to mutate (return a copy) the value

    // the return value in array and object type cases is ignored
    if (type === 'object' || type === 'array') {
        if (reactTo.includes('object') || reactTo.includes('array')) return mutator.call(null, entry);
    }

    if (type !== 'object' && type !== 'array') {
        if (
            reactTo.includes('string') ||
            reactTo.includes('null') ||
            reactTo.includes('bool')
        ) {
            // everything else that is not an object or an array must be assigned e.i. null, bool, string
            const mutation = mutator.call(null, entry);

            value[valueKey] = mutation;
        }
    }
}

/**
 * Iterates recursively over all possible values whether it is an object or array.
 * Does not mutate the values. If a value is an object or array, you have to change it yourself
 * within the reactor function. Primitive values (string, null, boolean) are mutated by returning
 * the mutation value from reactor function
 *
 * Usage:
 *
 * iterator(iterable, {
 *     reactTo: ['string', 'null', 'bool' 'object', 'array'],
 *     reactor: function(value) {
 *         If value is primitive type (bool, null, string), you have to return the mutated value
 *
 *         If value is object or array, you have to mutate it here, returned value is ignored
 *         in this case
 *     }
 * })
 * @param value
 * @param reactionOptions
 * @returns {boolean}
 */
function iterate(value, reactionOptions) {
    if (!isIterable(value)) return false;

    if (!is('object', reactionOptions)) throw new Error(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);

    if (!is('array', reactionOptions.reactTo)) throw new Error(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);

    const validReactions = ['string', 'array', 'object', 'bool', 'null'];
    for (let reaction of reactionOptions.reactTo) {
        if (!validReactions.includes(reaction)) throw new Error(`Invalid options type supplied to 'iterate'. options.reactTo must be one of '${validReactions.join(', ')}'`);
    }

    if (!is('function', reactionOptions.reactor)) throw new Error(`Invalid options supplied to 'iterate'. 'options' must be an object with property 'reactTo' that must be an array of strings and 'reactor' that must be a function`);

    /**
     * Specialised function for getting the type of value as string only for this iterator. Not usable
     * anywhere else
     * @param value
     * @returns {string}
     */

    const realIterator = function(value, reactionOptions) {
        if (is('object', value)) {
            for (let key in value) {
                const realEntry = value[key];

                mutate(value, key, realEntry, reactionOptions.reactTo, reactionOptions.reactor);

                // if a value is an iterator, recurse it
                if (isIterable(value)) realIterator(realEntry, reactionOptions);
            }
        }
    };

    realIterator(value, reactionOptions);
}

module.exports = {
    createGenerator,
    getArgNames,
    getArgs,
    hasKey,
    inArray,
    is,
    isAsyncFn,
    ucFirst,
    wait,
    IIterator,
    isEnvExpression,
    extractEnvExpression,
    isIterable,
    iterate,
};
