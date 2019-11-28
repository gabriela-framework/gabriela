"use strict";

const pluginExecuteFactory = require('./plugin/executeFactory');
const moduleExecuteFactory = require('./module/executeFactory');
const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const configFactory = require('./configFactory');
const Server = require('./server/server');
const Validator = require('./misc/validator');
const ExposedMediator = require('./events/exposedMediator');

const loggerProxy = require('./logging/loggerProxySingleton');
const LoggerFactory = require('./logging/loggerFactory');
const MemoryLogger = require('./logging/memoryLogger');
const MemoryLoggerSingleton = require('./logging/memoryLoggerSingleton');

// TODO: make the execution factories be per module or plugin.

module.exports = function _asServer(receivedConfig, events) {
    const config = configFactory.create(receivedConfig);
    const opts = events || {};

    loggerProxy.injectLogger(
        LoggerFactory.create(config),
        receivedConfig.config.framework.env
    );

    MemoryLoggerSingleton.injectLogger(MemoryLogger, config.config.framework.performance.memoryWarningLimit);

    Validator.validateServerOptions(config.config.server);

    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const exposedMediator = new ExposedMediator();
    const moduleTree = new ModuleTree(config, rootCompiler, sharedCompiler, exposedMediator);
    const pluginTree = new PluginTree(config, rootCompiler, sharedCompiler, exposedMediator);

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    const moduleInterface = {
        add(mdl) {
            moduleTree.addModule(mdl);
        },
        override: moduleTree.overrideModule,
        get: moduleTree.getModule,
        has: moduleTree.hasModule,
        getAll: moduleTree.getModules,
        remove: moduleTree.removeModule,
    };

    const pluginInterface = {
        add: pluginTree.addPlugin,
        get: pluginTree.getPlugin,
        remove: pluginTree.removePlugin,
        getAll: pluginTree.getPlugins,
        has: pluginTree.hasPlugin,
    };

    const publicInterface = {
        addModule: moduleInterface.add,
        overrideModule: moduleInterface.override,
        getModule: moduleInterface.get,
        removeModule: moduleInterface.remove,
        hasModule: moduleInterface.has,
        getModules: moduleInterface.getAll,
        addPlugin: pluginInterface.add,
        getPlugin: pluginInterface.get,
        removePlugin: pluginInterface.remove,
        hasPlugin: pluginInterface.has,
        getPlugins: pluginInterface.getAll,

        startApp(customMdlExecFactory = null, customPluginExecFactory = null) {
            const {events} = opts;

            // TODO: make the executionFactory argument be available here in the future and test it
            pluginInterface.run = pluginTree.runTree.bind(pluginTree);
            moduleInterface.run = moduleTree.runTree.bind(moduleTree);

            const server = new Server(
                config.config,
                events,
                rootCompiler,
                pluginInterface,
                moduleInterface,
            );

            server.run(moduleExecuteFactory, pluginExecuteFactory);
        }
    };

    return publicInterface;
};