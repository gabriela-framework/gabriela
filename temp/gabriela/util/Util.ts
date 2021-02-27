type Task<T> = () => T;

export function* createGenerator<T> (tasks: Task<T>[]) {
    for (let i = 0; i < tasks.length; i++) {
        yield tasks[i];
    }
}

export function ucFirst (str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function is(type: string, val: any): boolean {
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

export function isAsyncFn(val: Function): boolean {
    if (!val) return false;

    if (!val.constructor) return false;

    return val.constructor.name === 'AsyncFunction';
}

export function inArray<T>(array1: Array<T>, array2: Array<T>): boolean {
    for (const entry of array1) {
        if (array2.includes(entry)) return true;
    }

    return false;
}

export function wait(cb: Function): Promise<void> {
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

export function hasKey<T>(obj: Record<string, T>, key: string): boolean {
    if (!is('object', obj)) return false;

    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function getArgNames(func: Function): string[] {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;

    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

    if(result === null) {
        result = [];
    }

    return result;
}

export function getArgs(fn: Function, values: any) {
    const argNames = getArgNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!is('object', values)) {
            args.push({
                name: arg,
                value: null,
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

export class IIterator {
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

export function isEnvExpression(expression: string): boolean {
    const REGEX = /env\(\'\w+\'\)/i;

    return REGEX.test(expression);
}

export function extractEnvExpression(expression: string): string | undefined {
    const REGEX = /env\(\'(\w+)\'\)/i;

    const result = expression.match(REGEX);

    if (!result) return undefined;

    return result[1];
}

/**
 * Returns true only for iterator objects and array, not string since strings can be iterated also
 * @param value
 * @returns {boolean}
 */
export function isIterable<T>(value: Iterable<T>): boolean {
    if (!is('object', value) && !Array.isArray(value)) return false;

    if (is('function', value[Symbol.iterator])) return true;

    return is('object', value);
}

/**
 * Private to iterate(). Only used in iterate(). Do not use anywhere else
 * @param value
 * @returns {string}
 * @private
 */
export function _getType(value: any): StringifiedType {
    if (value === null) return 'null';
    if (is('object', value)) return 'object';
    if (Array.isArray(value)) return 'array';
    if (is('bool', value)) return 'bool';
    if (is('string', value)) return 'string';

    throw new Error('Unable to determine type. This should not happend in _getType()');
}

export function mutate<T>(value: T, valueKey: keyof T, entry: keyof T, reactTo: StringifiedType, mutator: (val: T) => void) {
    const type = _getType(entry);
    // if reaction type is an object or an array, reactor function is responsible
    // for the reaction and value change since both are references are
    // i don't want to mutate (return a copy) the value

    // the return value in array and object type cases is ignored
    if (type === 'object' || type === 'array') {
        //@ts-ignore
        if (reactTo.includes('object') || reactTo.includes('array')) return mutator.call(null, entry);
    }

    if (type !== 'object' && type !== 'array') {
        if (
            reactTo.includes('string') ||
            reactTo.includes('null') ||
            reactTo.includes('bool')
        ) {
            // everything else that is not an object or an array must be assigned e.i. null, bool, string
            //@ts-ignore
            const mutation = mutator.call(null, entry);

            //@ts-ignore
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

//@ts-ignore
export function iterate(value, reactionOptions) {
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

    //@ts-ignore
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
