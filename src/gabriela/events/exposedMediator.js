const {hasKey, getArgs, is} = require('../util/util');

/**
 * Using exposed mediator
 *
 * Exposed mediator creates its own definitions. Client code has no influence on it.
 *
 * This mediator has to be used as a deferred emitter. It cannot emit anything if definition to emit an event is not
 * pre bound to this mediator. Client code has to call preBind() method before emitting any event. It can optionally
 * call add() method first to declare a definition, and the preBind() to bind the actual event to that definition.
 */


function _callFn(fn, compiler, args) {
    const resolvedArgs = args.map((arg) => {
        let dep;

        if (compiler.has(arg.name)) {
            dep = compiler.compile(arg.name, compiler);
        }

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return arg.value;
    });

    fn.call(null, ...resolvedArgs);
}

function _callEvent(fn, compiler, customArgs) {
    let args = getArgs(fn);

    // if an error occurrences, it must be the first argument of customArgs
    // in client code, the error has to be the first argument
    if (customArgs && is('object', customArgs)) {
        for (const name in customArgs) {
            if (hasKey(customArgs, name)) {
                for (const arg of args) {
                    if (arg.name === name) arg.value = customArgs[name];
                }
            }
        }

        args = [...args];
    }

    _callFn(fn, compiler, args);
}

function factory() {
    const definitions = {};

    function emit(name, compiler, customArgs) {
        if (!hasKey(definitions, name)) throw new Error(`Invalid exposed event. Exposed event with name '${name}' does not exist`);

        // ran only when using with add()
        if (!definitions[name]) {
            definitions[name] = {
                fns: [],
                compiler,
                args: customArgs,
                emitted: null,
            };
        }

        // ran only when preBind() is called without add()
        if (!definitions[name].compiler) {
            definitions[name].compiler = compiler;
            definitions[name].args = customArgs;
        }

        definitions[name].emitted = true;

        if (definitions[name].fns) {
            for (const fn of definitions[name].fns) {
                _callEvent(fn, definitions[name].compiler, definitions[name].args);
            }

            if (!definitions[name].emitted) definitions[name].emitted = true;
        }
    }

    function isEmitted(name) {
        if (!definitions[name]) return false;

        return definitions[name].emitted;
    }

    function preBind(name, fn) {
        if (definitions[name] && definitions[name].emitted === true) throw new Error(`Internal Gabriela error. Invalid usage of exposed mediator instance. Exposed events must be first pre bound then emitted. It seems that event '${name}' has been emitted first and then bound. This should not happen`);

        if (!is('function', fn)) throw new Error(`Invalid exposed event. '${name}' event has tried to pre bind something that is not a function`);

        if (!definitions[name]) {
            definitions[name] = {
                fns: [],
                preBound: true,
                emitted: false,
            };

            definitions[name].fns.push(fn);

            return;
        }

        definitions[name].fns.push(fn);
    }

    function add(name) {
        if (has(name)) throw new Error(`Invalid exposed event. Exposed event with name '${name}' already exists`);

        definitions[name] = null;
    }

    function has(name) {
        return hasKey(definitions, name);
    }

    this.emit = emit;
    this.isEmitted = isEmitted;
    this.preBind = preBind;
    this.add = add;
    this.has = has;
}

module.exports = factory;