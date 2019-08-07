const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {ASYNC_FLOW_TYPES} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');
const {getArgs, inArray, hasKey, is} = require('../util/util');
const _callFn = require('./util/_callFn');

function _callEvent(fn, moduleOrPlugin, config, customArgs) {
    const taskRunner = taskRunnerFactory.create();

    /**
     * Get the argument list in the form
     *
     * {
     *     name: 'argName',
     *     value: null
     * }
     *
     * arg.value is null by default and is assigned later when resolving dependencies. If arg.name is a custom
     * dependency, it is resolved from customArgs and not from the compiler.
     *
     * If the values next or throwException are present, they are resolved as taskRunner.next and
     * taskRunner.throwException functions.
     * @type {Array|*}
     */
    let args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException,
    });

    /**
     * Custom arguments are resolved by name. If there is a custom argument with some name,
     * that name is added to arg.value. When _callFn() resolves an argument, it will skip
     * resolving it (calling the compiler) if the arg.value is not null.
     */
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

    // called if none of the next(), throwException() etc... functions is not present in the argument list
    if (!inArray(ASYNC_FLOW_TYPES, args.map(arg => arg.name))) {
        _callFn(fn, moduleOrPlugin, args, config);

        return;
    }

    _callFn(fn, moduleOrPlugin, args, config);

    // event loop is blocked here
    deasync.loopWhile(function() {
        return !(_waitCheck(taskRunner)).success;
    });

    const task = taskRunner.getTask();

    /**
     * If an error is thrown, the task runner is resolved immediately and the error is thrown
     */
    if (task === 'error') {
        const error = taskRunner.getValue();
        taskRunner.resolve();

        throw error;
    }

    taskRunner.resolve();
}

function instance(moduleOrPlugin, config) {
    const mediations = {};

    function emit(name, customArgs) {
        if (!hasKey(mediations, name)) throw new Error(`Invalid mediator event. Mediator with name '${name}' does not exist in module or plugin '${moduleOrPlugin.name}'`);

        const fn = mediations[name];

        _callEvent(fn, moduleOrPlugin, config, customArgs);
    }

    function has(name) {
        return hasKey(mediations, name);
    }

    function add(name, fn) {
        if (has(name)) throw new Error(`Invalid mediator event. Mediator with name '${name}' already exist`);

        mediations[name] = fn;
    }

    /**
     * runOnError is the same as emit except it assignes the e (Error instance) to the first
     * argument of the function, if the number of arguments is more than 0
     * @param fn
     * @param e
     */
    function runOnError(fn, e) {
        const args = getArgs(fn);
        if (args.length > 0) args[0].value = e;


        _callFn(fn, moduleOrPlugin, args, config);
    }

    /**
     * Simply calls the event once
     * @param fn
     * @param customArgs
     */
    function once(fn, customArgs) {
        _callEvent(fn, moduleOrPlugin, config, customArgs);
    }

    this.emit = emit;
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