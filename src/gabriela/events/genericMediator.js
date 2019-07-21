const deasync = require('deasync');

const {getArgs, inArray, hasKey} = require('../util/util');
const taskRunnerFactory = require('../misc/taskRunner');
const {ASYNC_FLOW_TYPES} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');

function _callFn(fn, rootCompiler, args, context) {
    const resolvedArgs = args.map((arg) => {
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
        if (hasKey(options, 'enableAsyncHandling') && !options.enableAsyncHandling) {
            const args = getArgs(fn);

            return _callFn(fn, rootCompiler, args, context);
        }

        const args = getArgs(fn, {
            next: taskRunner.next,
            throwException: taskRunner.throwException,
        });


        if (!inArray(ASYNC_FLOW_TYPES, args.map(arg => arg.name))) {
            _callFn(fn, rootCompiler, args, context);

            return;
        }

        _callFn(fn, rootCompiler, args, context);

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

    this.callEvent = callEvent;
}

function factory() {
    this.create = function(rootCompiler) {
        return new instance(rootCompiler);
    };
}

module.exports = new factory();