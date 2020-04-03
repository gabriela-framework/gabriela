require('strict-mode')(function () {
    require('./global');

    const Router = require('./router/router');
    const configFactory = require('./configFactory');

    module.exports = {
        asServer(config) {
            const httpConfigFactory = require('./config/httpConfigFactory');
            const resolvedConfig = httpConfigFactory.create(config);

            Router.injectRoutes(resolvedConfig.routes);

            return require('./_asServer').call(null, resolvedConfig);
        },

        asProcess(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = configFactory.getDefaultConfig();
            }

            return require('./_asProcess').call(null, receivedConfig, options);
        },
    };
});
