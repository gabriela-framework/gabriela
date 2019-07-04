const runMiddleware = require('./middleware/runMiddleware');
const deepCopy = require('deepcopy');
const callEvent = require('../events/callEvent');
const {is} = require('../util/util');

function _assignMediatorEvents(mdl, excludes) {
    if (mdl.hasMediators()) {
        const mediators = mdl.mediator;

        const props = Object.keys(mediators);

        for (const name of props) {
            if (!excludes.includes(name)) {
                mdl.mediatorInstance.add(name, mediators[name]);
            }
        }
    }
}

function _assignEmitterEvents(mdl) {
    if (mdl.hasEmitters()) {
        const subscribers = mdl.emitter;

        const props = Object.keys(subscribers);

        for (const name of props) {
            mdl.emitterInstance.add(name, subscribers[name]);
        }
    }
}

function _createContext({mediator, emitter}) {
    return {
        mediator,
        emitter,
    };
}

function factory() {
    function create(mdl) {
        return (function(mdl) {
            const state = {};

            async function run(childState, config) {
                if (childState) state.child = childState;

                _assignMediatorEvents(mdl, [
                    'onModuleStarted',
                    'onModuleFinished',
                    'onError',
                ]);

                _assignEmitterEvents(mdl);

                const context = _createContext({
                    mediator: {
                        emit(name, customArgs, propagate = false) {
                            if (!is('boolean', propagate)) throw new Error(`Invalid mediator event. Propagation argument for event '${name}' has to be a boolean`);

                            if (propagate) {
                                if (mdl.mediatorInstance.has(name)) mdl.mediatorInstance.emit(name, customArgs);
                                if (mdl.isInPlugin() && mdl.plugin.mediatorInstance.has(name)) return mdl.plugin.mediatorInstance.emit(name, customArgs);

                                return;
                            }

                            if (mdl.mediatorInstance.has(name)) return mdl.mediatorInstance.emit(name, customArgs);

                            if (mdl.isInPlugin() && mdl.plugin.mediatorInstance.has(name)) return mdl.plugin.mediatorInstance.emit(name, customArgs);

                            throw new Error(`Invalid mediator event. Mediator with name '${name}' does not exist in module '${mdl.name}'`);
                        }
                    },
                    emitter: mdl.emitterInstance,
                });

                const middleware = [
                    mdl.security,
                    mdl.preLogicTransformers,
                    mdl.validators,
                    mdl.moduleLogic,
                    mdl.postLogicTransformers,
                ];

                callEvent.call(mdl.mediatorInstance, mdl, 'onModuleStarted');

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

                        // throw error if it doesnt have any mediators
                        if (!mdl.hasMediators()) throw err;

                        // throw error if it has mediators but it does not have onError
                        if (mdl.hasMediators() && !mdl.mediator.onError) throw err;

                        mdl.mediatorInstance.runOnError(mdl.mediator.onError, err);
                    }
                }

                callEvent.call(mdl.mediatorInstance, mdl, 'onModuleFinished');
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