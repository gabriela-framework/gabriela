const deasync = require('deasync');
const _waitCheck = require('../util/_waitCheck');
const _isInjectionTypeInterface = require('./injectionTypes/_isInjectionTypeInterface');
/**
 * Resolves the service definition by calling its init function. This function should be called only once for
 * every service, depending on the situation.
 * @param definition
 * @param deps
 * @param taskRunner
 * @param injectionType
 * @returns {*}
 */
module.exports = function _resolveService(definition, deps, taskRunner, injectionType) {
    /**
     * If is asynchronous definition, e.i. it injected next() or throwException(), use deasync to block the event loop
     */
    if (definition.isAsync) {
        definition.init.call(injectionType, ...deps);

        deasync.loopWhile(function() {
            return !(_waitCheck(taskRunner)).success;
        });

        const task = taskRunner.getTask();

        if (task === 'error') {
            const error = taskRunner.getValue();

            return {
                isError: true,
                error: error,
                service: null
            };
        }

        const service = taskRunner.getValue().call(null);

        if (_isInjectionTypeInterface(service)) {
            return service;
        }

        taskRunner.resolve();

        return {
            isError: false,
            error: null,
            service: service,
        };
    } else {
        const service = definition.init.call(injectionType, ...deps);

        const task = taskRunner.getTask();

        if (task === 'error') {
            const error = taskRunner.getValue();

            return {
                isError: true,
                error: error,
                service: null
            };
        }

        if (_isInjectionTypeInterface(service)) {
            return service;
        }

        taskRunner.resolve();

        return {
            isError: false,
            error: null,
            service: service,
        };
    }
};