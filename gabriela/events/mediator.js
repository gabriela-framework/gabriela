const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {asyncFlowTypes} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

const {getArgs, inArray} = require('../util/util');

function _callFn(fn, mdl, args, config) {
    const resolvedArgs = args.map((arg) => {
        if (arg.value instanceof Error) {
            return arg.value;
        }

        const dep = resolveDependencies(
            mdl.compiler, 
            mdl.sharedCompiler, 
            arg.name, 
            config, 
            mdl.name, 
            mdl.plugin
        );

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return arg.value;
    });

    fn.call(null, ...resolvedArgs);
}

function _callEvent(fn, mdl, config, customArgs) {
    const taskRunner = taskRunnerFactory.create();

    const args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException,
    });

    // if an error occurres, it must be the first argument of customArgs
    // in client code, the error has to be the first argument
    if (customArgs && customArgs.length > 0) {
        if (customArgs[0] instanceof Error) {
            args[0].value = customArgs[0];
        }
    }


    if (!inArray(asyncFlowTypes, args.map(arg => arg.name))) {
        _callFn(fn, mdl, args, config);

        return;
    }

    _callFn(fn, mdl, args, config);

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

function instance(mdl, config) {
    const mediatons = {};

    function mediate(name, customArgs) {
        const fn = mediatons[name];

        _callEvent(fn, mdl, config, customArgs);
    }

    function add(name, fn) {
        mediatons[name] = fn;
    }

    function once(fn, customArgs) {
        _callEvent(fn, mdl, config, customArgs);
    }

    this.mediate = mediate;
    this.add = add;
    this.once = once;
}

function factory() {
    this.create = function(mdl, config) {
        return new instance(mdl, config);
    };
}

module.exports = new factory();