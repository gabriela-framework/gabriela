var is = require('../../util/util').is;
function factory() {
    var propertyInjection = require('./_propertyInjection');
    var methodInjection = require('./_methodInjection');
    var constructorInjection = require('./_constructorInjection');
    function withConstructorInjection(fnOrClass) {
        if (!is('function', fnOrClass))
            throw new Error("Invalid constructor injection. Injecting argument must be a function or a class");
        return new constructorInjection(fnOrClass);
    }
    function withPropertyInjection(object) {
        if (!is('object', object))
            throw new Error("Invalid property injection. Injecting argument must be an object");
        return new propertyInjection(object);
    }
    function withMethodInjection(object) {
        if (!is('object', object))
            throw new Error("Invalid method injection. Injecting argument must be an object");
        return new methodInjection(object);
    }
    this.withConstructorInjection = withConstructorInjection;
    this.withPropertyInjection = withPropertyInjection;
    this.withMethodInjection = withMethodInjection;
}
module.exports = factory;
//# sourceMappingURL=injectionType.js.map