const {is} = require('../../util/util');
const {INJECTION_TYPES} = require('../../misc/types');

function _validateArgs(args) {
    if (!is('object', args)) throw new Error(`Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string`);

    const asArray = Object.entries(args);

    if (asArray.length === 0) throw new Error(`Invalid property injection. You haven't supplied any arguments to be bound`);

    for (let [, value] of Object.entries(args)) {
        if (!is('string', value)) throw new Error(`Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string`);
    }
}

function factory(object) {
    function bind(args) {
        _validateArgs(args);

        return {
            type: INJECTION_TYPES.PROPERTY,
            object: object,
            args: args,
        }
    }

    this.bind = bind;
}

module.exports = factory;