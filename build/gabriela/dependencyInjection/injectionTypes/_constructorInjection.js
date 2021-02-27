var is = require('../../util/util').is;
var INJECTION_TYPES = require('../../misc/types').INJECTION_TYPES;
function _validateArgs(object, args) {
    if (args.length > 0) {
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (!is('string', arg))
                throw new Error("Invalid constructor injection. Arguments to be bound must a service as a string");
        }
    }
}
function factory(object) {
    function bind() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _validateArgs(object, args);
        return {
            type: INJECTION_TYPES.CONSTRUCTOR,
            object: object,
            args: args
        };
    }
    this.bind = bind;
}
module.exports = factory;
//# sourceMappingURL=_constructorInjection.js.map