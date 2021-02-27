const deasync = require('deasync');

const {getArgs, inArray, hasKey, is} = require('../util/util');
const taskRunnerFactory = require('../misc/taskRunner');
const {ASYNC_FLOW_TYPES} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');

/**
 * Generic mediator can be used in any context. Its only caveat is that it has to use only one compiler and that is the rootCompiler since
 * the root compiler does not have any compilers of its own.
 * @param fn
 * @param rootCompiler
 * @param args
 * @param context
 * @private
 */
function _callFn(fn, rootCompiler, args, context) {
    const resolvedArgs = args.map((arg) => {
        // if the value is already resolved, simply return it
        if (arg.value) return arg.value;

        const dep = rootCompiler.compile(arg.name, rootCompiler);

        if (!dep) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return dep;
    });

    fn.call((context) ? context : null, ...resolvedArgs);
}

function instance(rootCompiler) {
    const taskRunner = taskRunnerFactory.create();

    function callEvent(fn, context, options) {
        // enableAsyncHandling means that the calling code is sure that fn does not contain async code
        if (hasKey(options, 'enableAsyncHandling') && !options.enableAsyncHandling) {
            const args = getArgs(fn);

            return _callFn(fn, rootCompiler, args, context);
        }

        let args = getArgs(fn, {
            next: taskRunner.next,
            throwException: taskRunner.throwException,
        });

        // if there are no async functions like next(), skip() etc..., call it sync.
        if (!inArray(ASYNC_FLOW_TYPES, args.map(arg => arg.name))) {
            _callFn(fn, rootCompiler, args, context);

            return;
        }

        _callFn(fn, rootCompiler, args, context);

        deasync.loopWhile(function() {
            return !(_waitCheck(taskRunner)).success;
        });

        const task = taskRunner.getTask();

        if (task === 'error') {
            const error = taskRunner.getValue();
            taskRunner.resolve();

            throw error;
        }

        taskRunner.resolve();
    }

    /**
     * A special function that run only on error. The first argument is always populated with Error instance supplied. Everything
     * else is the same as any other function.
     * @param fn
     * @param context
     * @param err
     */
    function runOnError(fn, context, err) {
        const args = getArgs(fn);
        if (args.length > 0) args[0].value = err;

        _callFn(fn, rootCompiler, args, context);
    }

    this.runOnError = runOnError;
    this.callEvent = callEvent;
}

function factory() {
    this.create = function(rootCompiler) {
        return new instance(rootCompiler);
    };
}

module.exports = new factory();