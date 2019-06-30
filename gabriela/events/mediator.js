const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {asyncFlowTypes} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');
const {getArgs, inArray, hasKey} = require('../util/util');

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

function _callEvent(fn, moduleOrPlugin, config, customArgs) {
    const taskRunner = taskRunnerFactory.create();

    let args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException,
    });

    // if an error occurres, it must be the first argument of customArgs
    // in client code, the error has to be the first argument
    if (customArgs && customArgs.length > 0) {
        args = [...args, ...customArgs]
    }

    if (!inArray(asyncFlowTypes, args.map(arg => arg.name))) {
        _callFn(fn, moduleOrPlugin, args, config);

        return;
    }

    _callFn(fn, moduleOrPlugin, args, config);

    while(!(_waitCheck(taskRunner)).success) {
        deasync.sleep(0);
    }

    const task = taskRunner.getTask();

    if (task === 'error') {
        const error = taskRunner.getValue();
        taskRunner.resolve();

        throw error;
    }

    taskRunner.resolve();
}

function instance(moduleOrPlugin, config) {
    const mediatons = {};

    function mediate(name, customArgs) {
        const fn = mediatons[name];

        _callEvent(fn, moduleOrPlugin, config, customArgs);
    }

    function has(name) {
        return hasKey(mediations, name);
    }

    function add(name, fn) {
        mediatons[name] = fn;
    }

    function runOnError(fn, e) {
        const args = getArgs(fn);
        args[0].value = e;

        _callFn(fn, moduleOrPlugin, args, config);
    }

    function once(fn, customArgs) {
        _callEvent(fn, moduleOrPlugin, config, customArgs);
    }

    this.mediate = mediate;
    this.has = has;
    this.add = add;
    this.once = once;
    this.runOnError = runOnError;
}

function factory() {
    this.create = function(moduleOrPlugin, config) {
        return new instance(moduleOrPlugin, config);
    };
}

module.exports = new factory();