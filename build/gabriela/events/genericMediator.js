var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var deasync = require('deasync');
var _a = require('../util/util'), getArgs = _a.getArgs, inArray = _a.inArray, hasKey = _a.hasKey, is = _a.is;
var taskRunnerFactory = require('../misc/taskRunner');
var ASYNC_FLOW_TYPES = require('../misc/types').ASYNC_FLOW_TYPES;
var _waitCheck = require('../util/_waitCheck');
function _callFn(fn, rootCompiler, args, context) {
    var resolvedArgs = args.map(function (arg) {
        if (arg.value)
            return arg.value;
        var dep = rootCompiler.compile(arg.name, rootCompiler);
        if (!dep)
            throw new Error("Argument resolving error. Cannot resolve argument with name '" + arg.name + "'");
        return dep;
    });
    fn.call.apply(fn, __spreadArray([(context) ? context : null], resolvedArgs));
}
function instance(rootCompiler) {
    var taskRunner = taskRunnerFactory.create();
    function callEvent(fn, context, options) {
        if (hasKey(options, 'enableAsyncHandling') && !options.enableAsyncHandling) {
            var args_1 = getArgs(fn);
            return _callFn(fn, rootCompiler, args_1, context);
        }
        var args = getArgs(fn, {
            next: taskRunner.next,
            throwException: taskRunner.throwException
        });
        if (!inArray(ASYNC_FLOW_TYPES, args.map(function (arg) { return arg.name; }))) {
            _callFn(fn, rootCompiler, args, context);
            return;
        }
        _callFn(fn, rootCompiler, args, context);
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
    function runOnError(fn, context, err) {
        var args = getArgs(fn);
        if (args.length > 0)
            args[0].value = err;
        _callFn(fn, rootCompiler, args, context);
    }
    this.runOnError = runOnError;
    this.callEvent = callEvent;
}
function factory() {
    this.create = function (rootCompiler) {
        return new instance(rootCompiler);
    };
}
module.exports = new factory();
//# sourceMappingURL=genericMediator.js.map