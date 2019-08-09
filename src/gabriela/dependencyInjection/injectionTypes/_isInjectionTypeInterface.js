const {hasKey} = require('../../util/util');
const {INJECTION_TYPES} = require('../../misc/types');

module.exports = function isInjectionTypeInterface(service) {
    if (
        hasKey(service, 'type') &&
        hasKey(service, 'object') &&
        hasKey(service, 'args')
    ) {
        const type = service.type;

        return INJECTION_TYPES.toArray().includes(type);
    }

    return false;
};