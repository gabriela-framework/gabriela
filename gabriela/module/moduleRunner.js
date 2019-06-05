const taskRunnerFactory = require('./taskRunner');
const createGenerator = require('../util/createGenerator');

async function runMiddleware(state, middleware) {
    if (middleware && middleware.length > 0) {
        const generator = createGenerator(middleware);
        const taskRunner = taskRunnerFactory.create();
        
        async function recursiveMiddlewareExec(exec) {
            if (!exec) {
                return;
            }

            exec.call(null, ...[state, taskRunner.next, taskRunner.skip, taskRunner.done, taskRunner.throwException]);

            const wait = () => new Promise((resolve, reject)=> {
                const check = () => {
                    const task = taskRunner.getTask();
                    if (task) {
                        return resolve(task);
                    }

                    setTimeout(check, 0);
                }

                setTimeout(check, 0);
            });

            const task = await wait();  

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
    function create(mdl) {
        return (function(mdl) {
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
                        await runMiddleware.call(null, ...[state, m]);
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
        }(mdl));
    }

    this.create = create;
}

const inst = new factory();
inst.constructor.name = 'moduleRunner';

module.exports = inst;