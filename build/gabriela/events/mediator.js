var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var deasync = require('deasync');
var taskRunnerFactory = require('../misc/taskRunner');
var ASYNC_FLOW_TYPES = require('../misc/types').ASYNC_FLOW_TYPES;
var _waitCheck = require('../util/_waitCheck');
var _a = require('../util/util'), getArgs = _a.getArgs, inArray = _a.inArray, hasKey = _a.hasKey, is = _a.is;
var _callFn = require('./util/_callFn');
function _callEvent(fn, moduleOrPlugin, config, customArgs) {
    var taskRunner = taskRunnerFactory.create();
    var args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException
    });
    if (customArgs && is('object', customArgs)) {
        for (var name_1 in customArgs) {
            if (hasKey(customArgs, name_1)) {
                for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                    var arg = args_1[_i];
                    if (arg.name === name_1)
                        arg.value = customArgs[name_1];
                }
            }
        }
        args = __spreadArray([], args);
    }
    if (!inArray(ASYNC_FLOW_TYPES, args.map(function (arg) { return arg.name; }))) {
        _callFn(fn, moduleOrPlugin, args, config);
        return;
    }
    _callFn(fn, moduleOrPlugin, args, config);
    deasync.loopWhile(function () {
        return !(_waitCheck(taskRunner)).success;
    });
    var task = taskRunner.getTask();
    if (task === 'error') {
        var error = taskRunner.getValue();
        taskRunner.resolve();
        throw error;
    }
    taskRunner.resolve();
}
function instance(moduleOrPlugin, config) {
    var mediations = {};
    function emit(name, customArgs) {
        if (!hasKey(mediations, name))
            throw new Error("Invalid mediator event. Mediator with name '" + name + "' does not exist in module or plugin '" + moduleOrPlugin.name + "'");
        var fn = mediations[name];
        _callEvent(fn, moduleOrPlugin, config, customArgs);
    }
    function has(name) {
        return hasKey(mediations, name);
    }
    function add(name, fn) {
        if (has(name))
            throw new Error("Invalid mediator event. Mediator with name '" + name + "' already exist");
        mediations[name] = fn;
    }
    function runOnError(fn, e, httpContext) {
        if (httpContext === void 0) { httpContext = null; }
        var args = getArgs(fn);
        if (args.length > 0)
            args[0].value = e;
        for (var _i = 0, args_2 = args; _i < args_2.length; _i++) {
            var arg = args_2[_i];
            if (arg.name === 'http')
                arg.value = httpContext;
        }
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
    this.create = function (moduleOrPlugin, config) {
        return new instance(moduleOrPlugin, config);
    };
}
module.exports = new factory();
//# sourceMappingURL=mediator.js.map