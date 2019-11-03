const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const ModuleTree = require('../module/moduleTree');
const PluginTree = require('../plugin/pluginTree');
const Compiler = require('../dependencyInjection/compiler');
const configFactory = require('../configFactory');
const Server = require('./server');
const Validator = require('../misc/validator');
const ExposedMediator = require('../events/exposedMediator');

// TODO: make the execution factories be per module or plugin.

module.exports = function _asServer(receivedConfig, options) {
    const config = configFactory.create(receivedConfig);
    const opts = options || {};

    Validator.validateServerOptions(config.config.server);

    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const exposedMediator = new ExposedMediator();
    const moduleTree = new ModuleTree(config, rootCompiler, sharedCompiler, exposedMediator);
    const pluginTree = new PluginTree(config, rootCompiler, sharedCompiler, exposedMediator);

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    const runModule = async function(name, customExecutionFactory) {
        // TODO: validate that customExecutionFactory is a function, maybe add a warning and test it
        let executeFactory;
        if (customExecutionFactory) {
            executeFactory = customExecutionFactory.bind(null, null);
        } else {
            executeFactory = moduleExecutionFactory.bind(null, null);
        }

        if (name) return await moduleTree.runModule(name, executeFactory);

        return moduleTree.runTree(executeFactory);
    };

    const runPlugin = async function(name, customPluginExecutionFactory, customModuleExecutionFactory) {
        // TODO: validate that customPluginExecutionFactory and customModule... are functions, maybe add a warning and test it
        let executeFactory;
        if (customPluginExecutionFactory && customModuleExecutionFactory) {
            executeFactory = customPluginExecutionFactory.bind(null, customModuleExecutionFactory, null);
        } else {
            executeFactory = pluginExecutionFactory.bind(null, moduleExecutionFactory, null);
        }

        if (name) return pluginTree.runPlugin(name, executeFactory);

        return pluginTree.runTree(executeFactory);
    };

    const moduleInterface = {
        add(mdl) {
            moduleTree.addModule(mdl);
        },
    };

    const pluginInterface = {
        add: pluginTree.addPlugin,
    };

    const publicInterface = {
        addModule: moduleInterface.add,
        addPlugin: pluginInterface.add,
        runModule: runModule,
        runPlugin: runPlugin,

        run(name, customMdlExecFactory = null, customPluginExecFactory = null) {
            const {events} = opts;

            // TODO: make the executionFactory argument be available here in the future and test it
            pluginInterface.run = pluginTree.runTree.bind(pluginTree);
            moduleInterface.run = moduleTree.runTree.bind(moduleTree);

            moduleInterface.runModule = moduleTree.runModule.bind(moduleTree);
            moduleInterface.hasModule = moduleTree.hasModule.bind(moduleTree);

            pluginInterface.runPlugin = pluginTree.runPlugin.bind(pluginTree);
            pluginInterface.hasPlugin = pluginTree.hasPlugin.bind(pluginTree);

            const server = new Server(
                config.config.server,
                events,
                rootCompiler,
                pluginInterface,
                moduleInterface,
            );

            return server.run(name, moduleExecuteFactory, pluginExecuteFactory);
        }
    };

    return publicInterface;
};