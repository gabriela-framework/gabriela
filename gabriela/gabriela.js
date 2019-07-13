require('strict-mode')(function () {
    module.exports = {
        asServer(receivedConfig, options) {
            return require('./_asServer').call(null, receivedConfig, options);
        },

        asProcess(receivedConfig, options) {
            return require('./_asProcess').call(null, receivedConfig, options);
        }
    };
});