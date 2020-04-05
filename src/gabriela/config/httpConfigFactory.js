const deepcopy = require('deepcopy');
const {is, hasKey} = require('./../util/util');
const {ENV} = require('./../misc/types');
const {_replaceEnvironmentVariables} = require('./_shared');
const validateGabrielaEvents = require('../misc/validateGabrielaEvents');
const validateHttpEvents = require('../misc/validateHttpEvents');

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

    if (!hasKey(framework, 'loggingEnabled')) {
        newFramework.loggingEnabled = true;
    }

    if (is('boolean', framework.loggingEnabled)) {
        newFramework.loggingEnabled = framework.loggingEnabled;
    } else {
        newFramework.loggingEnabled = true;
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
    if (!Number.isInteger(parseInt(newServer.port))) throw new Error(`Invalid config. 'server.port' must be an integer.`);

    newServer.port = parseInt(newServer.port);

    if (!hasKey(server, 'viewEngine')) {
        server.viewEngine = {};
    }

    const viewEngine = server.viewEngine;

    if (!hasKey(viewEngine, 'views')) viewEngine.views = null;
    if (!hasKey(viewEngine, 'view engine')) viewEngine['view engine'] = null;
    if (!hasKey(viewEngine, 'engine')) viewEngine['engine'] = null;

    if (
        is('string', viewEngine.views) &&
        is('string', viewEngine['view engine']) &&
        (is('object', viewEngine['engine']) || is('function', viewEngine['engine']))
    ) {
        viewEngine.hasViewEngine = true;
    } else {
        viewEngine.hasViewEngine = false;
    }

    newServer.viewEngine = server.viewEngine;

    return newServer;
}

function _getDefaultFrameworkConfig() {
    return {
        env: ENV.DEVELOPMENT,
        performance: {
            memoryWarningLimit: 50,
        },
        loggingEnabled: true,
    }
}

function _getDefaultServerConfig() {
    return {
        host: '127.0.0.1',
        port: 3000,
        viewEngine: {
            views: null,
            'view engine': null,
            engine: null,
        }
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

        _replaceEnvironmentVariables(config);
        const resolvedConfig = _resolveConfig(config);

        validateGabrielaEvents(config.events);
        validateHttpEvents(config.events);

        return deepcopy(resolvedConfig);
    };
}

module.exports = new instance();
