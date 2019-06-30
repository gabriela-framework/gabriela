require('strict-mode')(function () {
    const _asProcess = require('./_asProcess');
    const _asServer = require('./_asServer');

    module.exports = {
        asServer(receivedConfig) {
            return _asServer.call(null, receivedConfig);
        },

        asProcess(receivedConfig) {
            return _asProcess.call(null, receivedConfig);
        }
    };
});