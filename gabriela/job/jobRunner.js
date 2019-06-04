const taskRunner = require('./taskRunner');
const createGenerator = require('../util/createGenerator');

async function runMiddleware(state, middleware) {
    if (middleware && middleware.length > 0) {
        const generator = createGenerator(middleware);

        async function recursiveMiddlewareExec(exec) {
            if (!exec) {
                return;
            }

            exec.call(null, ...[state, taskRunner.next, taskRunner.skip, taskRunner.done])

            let task;

            var wait = () => new Promise((resolve, reject)=> {
                const check = () => {
                    task = taskRunner.getTask();
                    if (task) {
                        return resolve(task);
                    }

                    setTimeout(check, 1);
                }

                setTimeout(check, 1);
            });

            task = await wait();

            switch (task) {
                case 'skip': {
                    return;
                }
                case 'done': {
                    const error = new Error('done');
                    error.internal = true;

                    throw error;
                }
            }

            const next = generator.next();

            return await recursiveMiddlewareExec((!next.done) ? next.value : false);
        }

        const next = generator.next();

        await recursiveMiddlewareExec((!next.done) ? next.value : false);
    }
}

function factory() {
    function create(job) {
        return (function(job) {
            const state = {};

            async function run(childState) {
                if (childState) state.child = childState;

                const middleware = [
                    job.preLogicTransformers,
                    job.validators,
                    job.jobLogic,
                    job.postLogicTransformers,
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
                                throw new Error(`Invalid ${job.name} middleware implementation. Either 'next', 'skip' or 'done' must be called in each middleware to continue to the next one`);
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
        }(job));
    }

    this.create = create;
}

const inst = new factory();
inst.constructor.name = 'jobRunner';

module.exports = inst;