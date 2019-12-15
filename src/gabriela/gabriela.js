require('strict-mode')(function () {
    require('./global');

    const Router = require('./router/router2');
    const configFactory = require('./configFactory');

    module.exports = {
        asServer(receivedConfig, routes, events) {
            if (!receivedConfig) {
                receivedConfig = configFactory.getDefaultConfig();
            }

            Router.injectRoutes(routes);

            return require('./_asServer').call(null, receivedConfig, events);
        },

        asProcess(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = configFactory.getDefaultConfig();
            }

            return require('./_asProcess').call(null, receivedConfig, options);
        },
    };
});