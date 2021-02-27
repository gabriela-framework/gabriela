var deepcopy = require('deepcopy');
var _a = require('./../util/util'), is = _a.is, hasKey = _a.hasKey;
var ENV = require('./../misc/types').ENV;
var _replaceEnvironmentVariables = require('./_shared')._replaceEnvironmentVariables;
var validateGabrielaEvents = require('../misc/validateGabrielaEvents');
function _resolveFramework(framework) {
    var newFramework = {};
    if (!is('string', framework.env)) {
        newFramework.env = ENV.DEVELOPMENT;
    }
    if (framework.env) {
        var env = framework.env;
        if (!ENV.toArray().includes(env)) {
            throw new Error("Invalid config. 'env' can only be 'dev' or 'prod'.");
        }
        newFramework.env = framework.env;
    }
    if (!hasKey(framework, 'loggingEnabled')) {
        newFramework.loggingEnabled = true;
    }
    if (is('boolean', framework.loggingEnabled)) {
        newFramework.loggingEnabled = framework.loggingEnabled;
    }
    else {
        newFramework.loggingEnabled = true;
    }
    if (!is('object', framework.performance)) {
        newFramework.performance = {
            memoryWarningLimit: 50
        };
    }
    if (framework.performance) {
        var performance_1 = framework.performance;
        if (!is('object', performance_1))
            throw new Error("Invalid config. 'framework.performance' must be an object.");
        if (hasKey(performance_1, 'memoryWarningLimit')) {
            if (!Number.isInteger(performance_1.memoryWarningLimit))
                throw new Error("Invalid config. 'framework.performance.memoryWarningLimit' must be an integer.");
        }
        else {
            performance_1.memoryWarningLimit = 50;
        }
        newFramework.performance = framework.performance;
    }
    return newFramework;
}
function _getDefaultFrameworkConfig() {
    return {
        env: ENV.DEVELOPMENT,
        performance: {
            memoryWarningLimit: 50
        },
        loggingEnabled: true
    };
}
function _getFullDefaultConfig() {
    return {
        framework: _getDefaultFrameworkConfig(),
        events: {},
        plugins: {}
    };
}
function _resolveConfig(config) {
    var newConfig = {
        events: config.events,
        plugins: config.plugins
    };
    var framework = config.framework;
    if (!is('object', framework)) {
        newConfig.framework = _getDefaultFrameworkConfig();
    }
    else {
        newConfig.framework = _resolveFramework(framework);
    }
    if (!is('object', newConfig.events))
        newConfig.events = {};
    if (!is('object', newConfig.plugins))
        newConfig.plugins = {};
    return newConfig;
}
function instance() {
    this.create = function (config) {
        if (!config) {
            return _getFullDefaultConfig();
        }
        if (!is('object', config)) {
            return _getFullDefaultConfig();
        }
        _replaceEnvironmentVariables(config);
        var resolvedConfig = _resolveConfig(config);
        validateGabrielaEvents(config.events);
        return deepcopy(resolvedConfig);
    };
}
module.exports = new instance();
//# sourceMappingURL=processConfigFactory.js.map