const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const mediatorFactory = require('../events/mediator');

function factory() {
    function create(mdl) {
        return (function(mdl) {
            const state = {};

            async function run(childState, config) {
                if (childState) state.child = childState;
                const mediator = mediatorFactory.create();

                const middleware = [
                    mdl.security,
                    mdl.preLogicTransformers,
                    mdl.validators,
                    mdl.moduleLogic,
                    mdl.postLogicTransformers,
                ];

                if (mdl.hasMediators() && mdl.mediator.onModuleStarted) {
                    mediator.once(mdl.mediator.onModuleStarted);
                }

                for (const functions of middleware) {
                    try {
                        await runMiddleware.call(null, ...[mdl, functions, state, config]);
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

                if (mdl.hasMediators() && mdl.mediator.onModuleFinished) {
                    mediator.once(mdl.mediator.onModuleFinished);
                }
            }

            function getResult() {
                return deepCopy(state);
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

module.exports = new factory();