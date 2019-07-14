const deepCopy = require('deepcopy');
const callEvent = require('../events/util/callEvent');
const {is} = require('../util/util');
const {BUILT_IN_MEDIATORS} = require('../misc/types');

function _assignMediatorEvents(mdl) {
    if (mdl.hasMediators()) {
        const mediators = mdl.mediator;

        const props = Object.keys(mediators);

        for (const name of props) {
            mdl.mediatorInstance.add(name, mediators[name]);
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

function _handleError(err, mdl) {
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

function _emitImplementationFactory(mdl) {
    return function(name, customArgs, propagate = false) {
        if (!is('boolean', propagate)) throw new Error(`Invalid mediator event. Propagation argument for event '${name}' has to be a boolean`);

        if (mdl.exposedMediator.has(name)) {
            return mdl.exposedMediator.emit(name, mdl.compiler.root, customArgs);
        }

        if (propagate) {
            if (mdl.mediatorInstance.has(name)) mdl.mediatorInstance.emit(name, customArgs);
            if (mdl.isInPlugin() && mdl.plugin.mediatorInstance.has(name)) return mdl.plugin.mediatorInstance.emit(name, customArgs);

            return;
        }

        if (mdl.mediatorInstance.has(name)) return mdl.mediatorInstance.emit(name, customArgs);

        if (mdl.isInPlugin() && mdl.plugin.mediatorInstance.has(name)) return mdl.plugin.mediatorInstance.emit(name, customArgs);

        throw new Error(`Invalid mediator event. Mediator with name '${name}' does not exist in module '${mdl.name}'`);
    };
}

function factory() {
    function create(mdl) {
        _assignMediatorEvents(mdl);
        _assignEmitterEvents(mdl);

        return (function(mdl) {
            const state = {};

            async function run(childState, config, executeFactory) {
                if (childState) state.child = childState;

                const context = _createContext({
                    mediator: {
                        emit: _emitImplementationFactory(mdl)
                    },
                    emitter: mdl.emitterInstance,
                });

                try {
                    if(mdl.mediatorInstance.has(BUILT_IN_MEDIATORS.ON_MODULE_STARTED)) callEvent.call(mdl.mediatorInstance, mdl, BUILT_IN_MEDIATORS.ON_MODULE_STARTED);

                    await executeFactory.call(null, mdl).call(null, mdl, context, config, state);

                    if(mdl.mediatorInstance.has(BUILT_IN_MEDIATORS.ON_MODULE_FINISHED)) callEvent.call(mdl.mediatorInstance, mdl, BUILT_IN_MEDIATORS.ON_MODULE_FINISHED);
                } catch (err) {
                    _handleError(err, mdl);
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