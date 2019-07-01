const {getArgs, hasKey} = require('../util/util');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

function _callFn(fn, moduleOrPlugin, args, config) {
    const resolvedArgs = args.map((arg) => {
        if (arg.value instanceof Error) {
            return arg.value;
        }

        const dep = resolveDependencies(
            moduleOrPlugin.compiler,
            moduleOrPlugin.sharedCompiler,
            arg.name,
            config,
            moduleOrPlugin.name,
            (hasKey('plugin', moduleOrPlugin)) ? moduleOrPlugin.plugin : null
        );

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return arg.value;
    });

    fn.call(null, ...resolvedArgs);
}

function instance(moduleOrPlugin, config) {
    const subscribers = {};

    function emit(name) {
        const fns = subscribers[name];

        for (const fn of fns) {
            new Promise((resolve) => {
                _callFn(fn, moduleOrPlugin, getArgs(fn), config);

                resolve();
            });
        }
    }

    function add(name, fn) {
        if (hasKey(subscribers, name)) throw new Error(`Invalid emitter event. Emitter with name '${name}' already exist`);
        subscribers[name] = fn;
    }

    this.emit = emit;
    this.add = add;
}

function factory(moduleOrPlugin, config) {
    this.create = function() {
        return new instance(moduleOrPlugin, config);
    };
}

module.exports = new factory();