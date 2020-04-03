const deepcopy = require('deepcopy');
const {is, hasKey} = require('./../util/util');
const {ENV} = require('./../misc/types');
const {_replaceEnvironmentVariables} = require('./_shared');
const validateGabrielaEvents = require('../misc/validateGabrielaEvents');

function _resolveFramework(framework) {
    const newFramework = {};
    if (!is('string', framework.env)) {
        newFramework.env = ENV.DEVELOPMENT;
    }

    if (framework.env) {
        const env = framework.env;

        if (!ENV.toArray().includes(env)) {
            throw new Error(`Invalid config. 'env' can only be 'dev' or 'prod'.`);
        }

        newFramework.env = framework.env;
    }

    if (!is('object', framework.performance)) {
        newFramework.performance = {
            memoryWarningLimit: 50,
        }
    }

    if (framework.performance) {
        const performance = framework.performance;

        if (!is('object', performance)) throw new Error(`Invalid config. 'framework.performance' must be an object.`);

        if (hasKey(performance, 'memoryWarningLimit')) {
            if (!Number.isInteger(performance.memoryWarningLimit)) throw new Error(`Invalid config. 'framework.performance.memoryWarningLimit' must be an integer.`);
        } else {
            performance.memoryWarningLimit = 50;
        }

        newFramework.performance = framework.performance;
    }

    return newFramework;
}

function _getDefaultFrameworkConfig() {
    return {
        env: ENV.DEVELOPMENT,
        performance: {
            memoryWarningLimit: 50,
        }
    }
}

function _getFullDefaultConfig() {
    return {
        framework: _getDefaultFrameworkConfig(),
        events: {},
        plugins: {},
    }
}

function _resolveConfig(config) {
    const newConfig = {
        events: config.events,
        plugins: config.plugins,
    };

    const framework = config.framework;

    if (!is('object', framework)) {
        newConfig.framework = _getDefaultFrameworkConfig();
    } else {
        newConfig.framework = _resolveFramework(framework);
    }

    if (!is('object', newConfig.events)) newConfig.events = {};
    if (!is('object', newConfig.plugins)) newConfig.plugins = {};

    return newConfig;
}

function instance() {
    this.create = function(config) {
        if (!config) {
            return _getFullDefaultConfig();
        }

        if (!is('object', config)) {
            return _getFullDefaultConfig();
        }

        const resolvedConfig = _resolveConfig(config);
        _replaceEnvironmentVariables(resolvedConfig);

        validateGabrielaEvents(config.events);

        return deepcopy(resolvedConfig);
    };
}

module.exports = new instance();
