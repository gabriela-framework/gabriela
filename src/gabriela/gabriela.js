const {ENV} = require('./misc/types');

require('strict-mode')(function () {
    require('./global');

    module.exports = {
        asServer(receivedConfig, options) {
            if (!receivedConfig) {
                receivedConfig = {
                    config: {framework: {
                        env: 'dev'
                    }}
                };
            }

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

            return require('./_asProcess').call(null, receivedConfig, options);
        },
    };
});