require('strict-mode')(function () {
    require('./global');

    module.exports = {
        asServer(config) {
            const httpConfigFactory = require('./config/httpConfigFactory');
            const resolvedConfig = httpConfigFactory.create(config);

            require('./router/router').injectRoutes(resolvedConfig.routes);

            return require('./_asServer').call(null, resolvedConfig);
        },

        asProcess(config) {
            const processConfigFactory = require('./config/processConfigFactory');
            const resolvedConfig = processConfigFactory.create(config);

            return require('./_asProcess').call(null, resolvedConfig);
        },
    };
});
