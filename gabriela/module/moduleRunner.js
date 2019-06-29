const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const mediatorFactory = require('../events/mediator');
const callEvent = require('../events/callEvent');

function _assignMediatorEvents(mdl, mediator, excludes) {
    if (mdl.hasMediators()) {
        const mediators = mdl.mediator;

        const props = Object.keys(mediators);

        for (const name of props) {
            if (!excludes.includes(mediator)) {
                mediator.add(name, mediators[name]);
            }
        }
    }
}

function _createContext({mediator}) {
    return {
        mediator
    };
}

function factory() {
    function create(mdl) {
        return (function(mdl) {
            const state = {};

            async function run(childState, config) {
                if (childState) state.child = childState;

                const mediator = mediatorFactory.create(mdl, config);
                _assignMediatorEvents(mdl, mediator, [
                    'onModuleStarted',
                    'onModuleFinished',
                    'onError',
                ]);

                const context = _createContext({
                    mediator,
                });

                const middleware = [
                    mdl.security,
                    mdl.preLogicTransformers,
                    mdl.validators,
                    mdl.moduleLogic,
                    mdl.postLogicTransformers,
                ];

                callEvent.call(mediator, mdl, 'onModuleStarted');

                for (const functions of middleware) {
                    try {
                        await runMiddleware.call(context, ...[mdl, functions, state, config]);
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

                callEvent.call(mediator, mdl, 'onModuleFinished');
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