const {is} = require('../../util/util');

function factory() {
    const propertyInjection = require('./_propertyInjection');

    function withConstructorInjection() {

    }

    function withPropertyInjection(object) {
        if (!is('object', object)) throw new Error(`Invalid property injection. Injecting argument must be an object`);

        return new propertyInjection(object);
    }

    function withMethodInjection(object) {
    }

    this.withConstructorInjection = withConstructorInjection;
    this.withPropertyInjection = withPropertyInjection;
    this.withMethodInjection = withMethodInjection;
}

module.exports = factory;