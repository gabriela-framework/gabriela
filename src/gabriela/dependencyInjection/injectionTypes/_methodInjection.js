const {hasKey, is} = require('../../util/util');

function validateArgs(object, args) {
    if (!is('object', args)) throw new Error(`Invalid method injection. Arguments to be bound must be an object with key -> method name on the service object and value -> service name as string`);

    if (Object.keys(args).length === 0) throw new Error(`Invalid method injection. If you choose to use method injection, you have to provide methods and services to bind with the bind() method`);

    for (let [method, value] of Object.entries(args)) {
        if (!is('string', value)) throw new Error(`Invalid method injection. Arguments to be bound must be an object with key -> method name on the service object and value -> service name as string`);

        if (!hasKey(object, method)) throw new Error(`Invalid method injection. Method '${method}' does not exist`);

        if (!is('function', object[method])) throw new Error(`Invalid method injection. Method '${method}' must be a function type`);
    }
}

function _methodInjection(object) {
    function bind(args) {
        validateArgs(object, args);
    }

    this.bind = bind;
}

module.exports = _methodInjection;