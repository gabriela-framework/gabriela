const taskRunnerFactory = require('./taskRunner');
const createGenerator = require('../util/createGenerator');
const getArgs = require('../util/getArgs');
const wait = require('../util/wait');

function waitCheck(taskRunner) {
    const task = taskRunner.getTask();
    if (task) {
        return {
            success: true,
            value: task,
        }
    }

    return {success: false}
}

function callImplicitNext(args, taskRunner) {
    const nonImplicit = ['done', 'skip', 'throwException'];
    let hasNext = false;

    for (const arg of args) {
        if (nonImplicit.includes(arg.name)) {
            return;
        }

        if (arg.name === 'next') {
            hasNext = true;
        }
    }

    if (hasNext) {
        taskRunner.next();
    }
}

async function runMiddleware(state, middleware, http) {
    if (middleware && middleware.length > 0) {
        const generator = createGenerator(middleware);
        const taskRunner = taskRunnerFactory.create();
        
        async function recursiveMiddlewareExec(exec) {
            if (!exec) {
                return;
            }

            let args = getArgs(exec, {
                next: taskRunner.next,
                done: taskRunner.done,
                skip: taskRunner.skip,
                throwException: taskRunner.throwException,
            }, (argName) => {
                if (argName === 'state') {
                    return state;
                }

                if (argName === 'http') {
                    return http;
                }
            });

            exec.call(null, ...args.map((val) => {
                return val.value;
            }));

            // todo: this code should be uncommented when the configuration values for middleware
            // includes the option to specify it as async or non async for better performance
            //callImplicitNext(args, taskRunner);

            const task = await wait(waitCheck.bind(null, taskRunner));

            switch (task) {
                case 'skip': {
                    taskRunner.resolve();
                    
                    return;
                }

                case 'done': {   
                    taskRunner.resolve();

                    const error = new Error('done');
                    error.internal = true;

                    throw error;
                }

                case 'error': {
                    const error = taskRunner.getValue();
                    taskRunner.resolve();

                    throw error;
                }
            }

            taskRunner.resolve();

            const next = generator.next();

            return await recursiveMiddlewareExec((!next.done) ? next.value : false);
        }

        const next = generator.next();

        await recursiveMiddlewareExec((!next.done) ? next.value : false);
    }
}

function factory() {
    function create(mdl, http) {
        return (function(mdl, http) {
            const state = {};

            async function run(childState) {
                if (childState) state.child = childState;

                const middleware = [
                    mdl.preLogicTransformers,
                    mdl.validators,
                    mdl.moduleLogic,
                    mdl.postLogicTransformers,
                ];

                for (const m of middleware) {
                    try {
                        await runMiddleware.call(null, ...[state, m, http]);
                    } catch (err) {
                        if (err.internal) {
                            if (err.message === 'done') {
                                return;
                            }

                            if (err.message === 'task') {
                                throw new Error(`Invalid ${mdl.name} middleware implementation. Either 'next', 'skip' or 'done' must be called in each middleware to continue to the next one`);
                            }
                        }

                        throw err;
                    }
                }
            }

            function getResult() {
                return Object.assign({}, state);
            }

            function instance() {
                this.run = run;
                this.getResult = getResult;
            }

            return new instance();
        }(mdl, http));
    }

    this.create = create;
}

const inst = new factory();
inst.constructor.name = 'moduleRunner';

module.exports = inst;