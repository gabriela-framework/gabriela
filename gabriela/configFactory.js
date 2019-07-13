const deepCopy = require('deepcopy');
const {is, hasKey} = require('./util/util');

function factory(config) {
    return config;
}

function instance() {
    this.create = function(config) {
        if (!is('object', config)) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        if (!hasKey(config, 'config')) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        if (!is('object', config.config)) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        return factory(deepCopy(config));
    };
}

module.exports = new instance();