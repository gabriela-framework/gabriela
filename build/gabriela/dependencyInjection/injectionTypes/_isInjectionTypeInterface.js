var hasKey = require('../../util/util').hasKey;
var INJECTION_TYPES = require('../../misc/types').INJECTION_TYPES;
module.exports = function isInjectionTypeInterface(service) {
    if (hasKey(service, 'type') &&
        hasKey(service, 'object') &&
        hasKey(service, 'args')) {
        var type = service.type;
        return INJECTION_TYPES.toArray().includes(type);
    }
    return false;
};
//# sourceMappingURL=_isInjectionTypeInterface.js.map