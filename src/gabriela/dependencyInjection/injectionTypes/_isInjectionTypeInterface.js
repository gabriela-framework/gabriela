const {hasKey} = require('../../util/util');
const {INJECTION_TYPE} = require('../../misc/types');

module.exports = function isInjectionTypeInterface(service) {
    if (
        hasKey('type', service) &&
        hasKey(service, 'object') &&
        hasKey(service, 'args')
    ) {
        const type = service.type;

        return INJECTION_TYPE.toArray().includes(type);
    }

    return false;
};