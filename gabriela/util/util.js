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

function getArgs(fn, values, specialCb) {
    const argNames = getArgNames(fn);

    const args = [];

    for (const arg of argNames) {
        if (!is('object', values)) {
            args.push({
                name: arg,
                value: null,
            });
        } else if (!hasKey(values, arg) && specialCb) {
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

module.exports = {
    createGenerator,
    getArgNames,
    getArgs,
    hasKey,
    inArray,
    is,
    ucFirst,
    wait,
};