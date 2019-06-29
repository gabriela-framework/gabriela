const deepCopy = require('deepcopy');
const {is} = require('./util/util');

function factory(config) {
    return config;
}

function instance() {
    this.create = function(config) {
        return factory(deepCopy((is('object', config) ? config : {})));
    };
}

module.exports = new instance();