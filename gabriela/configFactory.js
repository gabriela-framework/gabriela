const deepCopy = require('deepcopy');
const is = require('./util/is');

function factory(config) {
    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get (target, prop, receiver) {
            return target[prop];
        }
    };

    return new Proxy(config , handlers);
}

function instance() {
    this.create = function(config) {
        return factory(deepCopy((is('object', config) ? config : {})));
    }
}

module.exports = new instance();