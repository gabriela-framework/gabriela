const {hasKey, is} = require('../../util/util');
const {INJECTION_TYPES} = require('../../misc/types');

function _validateArgs(object, args) {
    if (!is('object', args)) throw new Error(`Invalid method injection. Arguments to be bound must be an object with key -> method name on the service object and value -> service name as string`);

    if (Object.keys(args).length === 0) throw new Error(`Invalid method injection. If you choose to use method injection, you have to provide methods and services to bind with the bind() method`);

    for (let [method, value] of Object.entries(args)) {
        if (!is('string', value)) throw new Error(`Invalid method injection. Arguments to be bound must be an object with key -> method name on the service object and value -> service name as string`);

        if (!hasKey(object, method)) throw new Error(`Invalid method injection. Method '${method}' does not exist`);

        if (!is('function', object[method])) throw new Error(`Invalid method injection. Method '${method}' must be a function type`);
    }
}

function factory(object) {
    function bind(args) {
        _validateArgs(object, args);

        return {
            type: INJECTION_TYPES.METHOD,
            object: object,
            args: args,
        }
    }

    this.bind = bind;
}

module.exports = factory;