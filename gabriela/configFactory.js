const deepCopy = require('deepcopy');
const {is} = require('./util/util');

function factory(config) {
    const handlers = {
        set() {
            return undefined;
        },

        get (target, prop) {
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