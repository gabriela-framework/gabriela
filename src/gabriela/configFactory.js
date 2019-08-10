const deepCopy = require('deepcopy');
const {is, hasKey, isEnvExpression, extractEnvExpression} = require('./util/util');
const {ENV} = require('./misc/types');

function factory(config) {
    return config;
}

function _validateFramework(framework) {
    if (!framework) throw new Error(`Invalid config. 'framework' property must exist in configuration.`);

    if (!is('object', framework)) throw new Error(`Invalid config. 'framework' property must be an object.`);

    // validating environment here
    const env = framework.env;

    if (!env) framework.env = ENV.DEVELOPMENT;

    if (env && !ENV.toArray().includes(env)) throw new Error(`Invalid config. Invalid environment. Valid environments are ${ENV.toArray().join(',')}`);
}

function instance() {
    this.create = function(config) {
        if (!is('object', config)) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        if (!hasKey(config, 'config')) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        if (!is('object', config.config)) throw new Error(`Invalid config. Gabriela configuration must be a plain javascript object with only the mandatory 'config' property that also must be a plan object (even if empty)`);

        _validateFramework(config.config.framework);

        return factory(deepCopy(config));
    };
}

module.exports = new instance();