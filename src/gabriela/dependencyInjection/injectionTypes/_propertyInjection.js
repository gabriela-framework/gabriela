const {is} = require('../../util/util');
const {INJECTION_TYPES} = require('../../misc/types');

function validateArgs(args) {
    if (!is('object', args)) throw new Error(`Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string`);

    for (let [, value] of Object.entries(args)) {
        if (!is('string', value)) throw new Error(`Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string`);
    }
}

function factory(object) {
    function bind(args) {
        validateArgs(args);

        return {
            type: INJECTION_TYPES.PROPERTY,
            object: object,
            args: args,
        }
    }

    this.bind = bind;
}

module.exports = factory;