var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var deasync = require('deasync');
var _waitCheck = require('../util/_waitCheck');
var _isInjectionTypeInterface = require('./injectionTypes/_isInjectionTypeInterface');
module.exports = function _resolveService(definition, deps, taskRunner, injectionType) {
    var _a, _b;
    if (definition.isAsync) {
        (_a = definition.init).call.apply(_a, __spreadArray([injectionType], deps));
        deasync.loopWhile(function () {
            return !(_waitCheck(taskRunner)).success;
        });
        var task = taskRunner.getTask();
        if (task === 'error') {
            var error = taskRunner.getValue();
            return {
                isError: true,
                error: error,
                service: null
            };
        }
        var service = taskRunner.getValue().call(null);
        taskRunner.resolve();
        return {
            isError: false,
            error: null,
            service: service
        };
    }
    else {
        var service = (_b = definition.init).call.apply(_b, __spreadArray([injectionType], deps));
        var task = taskRunner.getTask();
        if (task === 'error') {
            var error = taskRunner.getValue();
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
            service: service
        };
    }
};
//# sourceMappingURL=_resolveService.js.map