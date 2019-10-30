require('strict-mode')(function () {
    require('./global');

    module.exports = {
        asServer(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = {
                    config: {framework: {}}
                };
            }

            return require('./_asServer').call(null, receivedConfig, options);
        },

        asProcess(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = {
                    config: {framework: {}}
                };
            }

            return require('./_asProcess').call(null, receivedConfig, options);
        },

        asTest(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = {
                    config: {framework: {}}
                };
            }

            return require('./_asTest').call(null, receivedConfig, options);
        }
    };
});