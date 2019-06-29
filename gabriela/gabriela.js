const _asRunner = require('./_asRunner');
const _asServer = require('./_asServer');

module.exports = {
    asServer(receivedConfig) {
        return _asServer.call(null, receivedConfig);
    },

    asRunner(receivedConfig) {
        return _asRunner.call(null, receivedConfig);
    }
};