const deasync = require('deasync');
const _waitCheck = require('../util/_waitCheck');

module.exports = function _resolveService(definition, deps, taskRunner) {
    let service;
    if (definition.isAsync) {
        definition.init(...deps);

        deasync.loopWhile(function() {
            return !(_waitCheck(taskRunner)).success;
        });

        service = taskRunner.getValue().call(null);

        taskRunner.resolve();
    } else {
        service = definition.init.call(null, ...deps);

        taskRunner.resolve();
    }

    return service;
};