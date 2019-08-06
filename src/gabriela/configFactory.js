const deepCopy = require('deepcopy');
const {is, hasKey} = require('./util/util');
const {ENV} = require('./misc/types');

function factory(config) {
    return config;
}

function validateFramework(framework) {
    if (!framework) throw new Error(`Invalid config. 'framework' property must exist in configuration.`);

    if (!is('object', framework)) throw new Error(`Invalid config. 'framework' property must be an object.`);
}

function instance() {
    this.create = function(config) {
        if (!is('object', config)) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        if (!hasKey(config, 'config')) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        if (!is('object', config.config)) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        validateFramework(config.config.framework);

        return factory(deepCopy(config));
    };
}

module.exports = new instance();