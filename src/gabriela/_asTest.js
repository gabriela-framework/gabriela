const TestingEnvironment = require('./testing/mock/http');

module.exports = function _asTestingEnvironment(receivedConfig, options) {
    return new TestingEnvironment(receivedConfig, options);
};