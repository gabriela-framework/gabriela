const runMiddleware = require('./middleware/runMiddleware');

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

                for (const functions of middleware) {
                    try {
                        await runMiddleware.call(null, ...[mdl, functions, state, http]);
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

module.exports = new factory();