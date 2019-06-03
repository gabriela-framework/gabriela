const taskRunner = require('./taskRunner');
const createGenerator = require('../util/createGenerator');

async function runMiddleware(state, middleware) {
    if (middleware && middleware.length > 0) {
        const generator = createGenerator(middleware);

        let t = null;

        async function recursiveMiddlewareExec(exec) {
            if (!exec) {
                return;
            }

            const asyncFunc = async () => {
                exec.call(null, ...[state, taskRunner.next, taskRunner.skip, taskRunner.done])
            }

            await asyncFunc();

            const option = taskRunner.getOption();

            if (!option) {
                const error = new Error(`'next', 'done' or 'skip' function has to be called. You have to call one of these functions (based on your logic) in order for the next middleware to be called`);
                error.internal = true;
            }

            taskRunner.reset();

            switch (option) {
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