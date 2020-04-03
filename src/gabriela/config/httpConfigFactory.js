const deepcopy = require('deepcopy');
const {is, hasKey, isEnvExpression, extractEnvExpression, iterate} = require('./../util/util');
const {ENV} = require('./../misc/types');

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

function _resolveServer(server) {
    const newServer = {
        host: server.host,
        port: server.port,
    };

    if (!hasKey(server, 'host')) newServer.host = '127.0.0.1';
    if (!hasKey(server, 'port')) newServer.port = 3000;

    if (!is('string', newServer.host)) throw new Error(`Invalid config. 'server.host' must be a string.`);
    if (!Number.isInteger(newServer.port)) throw new Error(`Invalid config. 'server.port' must be an integer.`);

    return newServer;
}

function _replaceEnvironmentVariables(config) {
    iterate(config, {
        reactTo: ['string'],
        reactor(value) {
            if (isEnvExpression(value)) {
                const env = extractEnvExpression(value);

                if (!process.env[env]) throw new Error(`Invalid config. Environment variable '${env}' does not exist`);

                return process.env[env];
            }

            return value;
        }
    });
}

function _getDefaultFrameworkConfig() {
    return {
        env: ENV.DEVELOPMENT,
        performance: {
            memoryWarningLimit: 50,
        }
    }
}

function _getDefaultServerConfig() {
    return {
        host: '127.0.0.1',
        port: 3000,
    };
}

function _getFullDefaultConfig() {
    return {
        framework: _getDefaultFrameworkConfig(),
        server: _getDefaultServerConfig(),
        events: {},
        routes: [],
        plugins: {},
    }
}

function _resolveConfig(config) {
    const newConfig = {
        events: config.events,
        plugins: config.plugins,
        routes: config.routes,
    };

    const framework = config.framework;
    const server = config.server;

    if (!is('object', framework)) {
        newConfig.framework = _getDefaultFrameworkConfig();
    } else {
        newConfig.framework = _resolveFramework(framework);
    }

    if (!is('object', server)) {
        newConfig.server = _getDefaultServerConfig();
    } else {
        newConfig.server = _resolveServer(server);
    }

    if (!is('object', newConfig.events)) newConfig.events = {};
    if (!is('object', newConfig.plugins)) newConfig.plugins = {};
    if (!Array.isArray(newConfig.routes)) newConfig.routes = [];

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

        return deepcopy(resolvedConfig);
    };

    this.getDefaultConfig = function() {
        return {
            config: {
                framework: {
                    env: ENV.DEVELOPMENT,
                    performance: {
                        memoryWarningLimit: 50,
                    }
                }
            }
        };
    }
}

module.exports = new instance();
