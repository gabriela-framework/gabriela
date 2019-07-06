require('strict-mode')(function () {
    module.exports = {
        asServer(receivedConfig) {
            return require('./_asServer').call(null, receivedConfig);
        },

        asProcess(receivedConfig) {
            return require('./_asProcess').call(null, receivedConfig);
        }
    };
});