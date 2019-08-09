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
    let service;

    /**
     * If is asynchronous definition, e.i. it injected next() or throwException(), use deasync to block the event loop
     */
    if (definition.isAsync) {
        definition.init(...deps);

        deasync.loopWhile(function() {
            return !(_waitCheck(taskRunner)).success;
        });

        service = taskRunner.getValue().call(null);

        taskRunner.resolve();
    } else {
        service = definition.init.call(injectionType, ...deps);

        if (_isInjectionTypeInterface(service)) {
            return service;
        }

        taskRunner.resolve();
    }

    return service;
};