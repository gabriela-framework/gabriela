var is = require('../../util/util').is;
var INJECTION_TYPES = require('../../misc/types').INJECTION_TYPES;
function _validateArgs(args) {
    if (!is('object', args))
        throw new Error("Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string");
    var asArray = Object.entries(args);
    if (asArray.length === 0)
        throw new Error("Invalid property injection. If you choose to use method injection, you have to provide methods and services to bind with the bind() method");
    for (var _i = 0, _a = Object.entries(args); _i < _a.length; _i++) {
        var _b = _a[_i], value = _b[1];
        if (!is('string', value))
            throw new Error("Invalid property injection. Arguments to be bound must be an object with key -> property name on the service object and value -> service name as string");
    }
}
function factory(object) {
    function bind(args) {
        _validateArgs(args);
        return {
            type: INJECTION_TYPES.PROPERTY,
            object: object,
            args: args
        };
    }
    this.bind = bind;
}
module.exports = factory;
//# sourceMappingURL=_propertyInjection.js.map