const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const configFactory = require('./configFactory');
const Process = require('./process/process');
const ExposedMediator = require('./events/exposedMediator');
const moduleExecutionFactory = require('./module/executeFactory');
const pluginExecutionFactory = require('./plugin/executeFactory');
const TestingEnvironment = require('./testing/faker');

module.exports = function _asTestingEnvironment(receivedConfig, options) {
    const config = configFactory.create(receivedConfig);
    const opts = options || {}

    return new TestingEnvironment(config, opts);
};