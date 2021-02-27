require('strict-mode')(function () {
    require('./global');
    module.exports = {
        asServer: function (config) {
            var httpConfigFactory = require('./config/httpConfigFactory');
            var resolvedConfig = httpConfigFactory.create(config);
            require('./router/router').injectRoutes(resolvedConfig.routes);
            return require('./_asServer').call(null, resolvedConfig);
        },
        asProcess: function (config) {
            var processConfigFactory = require('./config/processConfigFactory');
            var resolvedConfig = processConfigFactory.create(config);
            return require('./_asProcess').call(null, resolvedConfig);
        }
    };
});
//# sourceMappingURL=gabriela.js.map