require('strict-mode')(function () {
    require('./global');
    const {ENV} = require('./misc/types');

    const loggerProxy = require('./logging/loggerProxySingleton');
    const LoggerFactory = require('./logging/loggerFactory');
    const Router = require('./router/router');

    module.exports = {
        asServer(receivedConfig, routes, events) {
            if (!receivedConfig) {
                receivedConfig = {
                    config: {framework: {
                        env: 'dev'
                    }}
                };
            }

            if (!receivedConfig.config.framework.env) {
                receivedConfig.config.framework.env = ENV.DEVELOPMENT;
            }

            loggerProxy.injectLogger(
                LoggerFactory.create(receivedConfig),
                receivedConfig.config.framework.env
            );

            Router.injectRoutes(routes);

            return require('./_asServer').call(null, receivedConfig, events);
        },

        asProcess(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = {
                    config: {framework: {
                        env: 'dev'
                    }}
                };
            }

            if (!receivedConfig.config.framework.env) {
                receivedConfig.config.framework.env = ENV.DEVELOPMENT;
            }

            loggerProxy.injectLogger(
                LoggerFactory.create(receivedConfig),
                receivedConfig.config.framework.env
            );

            return require('./_asProcess').call(null, receivedConfig, options);
        },
    };
});