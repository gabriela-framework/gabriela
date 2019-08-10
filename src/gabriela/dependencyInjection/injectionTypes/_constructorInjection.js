const {is} = require('../../util/util');
const {INJECTION_TYPES} = require('../../misc/types');

function _validateArgs(object, args) {
    if (!is('string', args)) throw new Error(`Invalid constructor injection. Arguments to be bound must a service as a string`);
}

function factory(object) {
    function bind(args) {
        _validateArgs(object, args);

        return {
            type: INJECTION_TYPES.CONSTRUCTOR,
            object: object,
            args: args,
        }
    }

    this.bind = bind;
}

module.exports = factory;