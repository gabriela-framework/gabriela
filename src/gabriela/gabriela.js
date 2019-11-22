require('strict-mode')(function () {
    require('./global');
    const {ENV} = require('./misc/types');

    const loggerProxy = require('./logging/loggerProxySingleton');
    const LoggerFactory = require('./logging/loggerFactory');

    module.exports = {
        asServer(receivedConfig, options) {
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

            return require('./_asServer').call(null, receivedConfig, options);
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