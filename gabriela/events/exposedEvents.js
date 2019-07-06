const {hasKey, getArgs, is} = require('../util/util');

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

    // if an error occurres, it must be the first argument of customArgs
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

        _callEvent(definitions[name].init, compiler, customArgs);
    }

    function add(name) {
        if (has(name)) throw new Error(`Invalid exposed event. Exposed event with name '${name}' already exists`);

        definitions[name] = null;
    }

    function has(name) {
        return hasKey(definitions, name);
    }

    this.emit = emit;
    this.add = add;
    this.has = has;
}

module.exports = factory;