const TestingEnvironment = require('./testing/faker');

module.exports = function _asTestingEnvironment(receivedConfig, options) {
    return new TestingEnvironment(receivedConfig, options);
};