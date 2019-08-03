const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {ASYNC_FLOW_TYPES} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');
const {getArgs, inArray, hasKey, is} = require('../util/util');
const _callFn = require('./util/_callFn');

function _callEvent(fn, moduleOrPlugin, config, customArgs) {
    const taskRunner = taskRunnerFactory.create();

    let args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException,
    });

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

    if (!inArray(ASYNC_FLOW_TYPES, args.map(arg => arg.name))) {
        _callFn(fn, moduleOrPlugin, args, config);

        return;
    }

    _callFn(fn, moduleOrPlugin, args, config);

    deasync.loopWhile(function() {
        return !(_waitCheck(taskRunner)).success;
    });
/*    while(!(_waitCheck(taskRunner)).success) {
        deasync.sleep(0);
    }*/

    const task = taskRunner.getTask();

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

    function runOnError(fn, e) {
        const args = getArgs(fn);
        if (args.length > 0) args[0].value = e;


        _callFn(fn, moduleOrPlugin, args, config);
    }

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