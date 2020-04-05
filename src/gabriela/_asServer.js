const pluginExecuteFactory = require('./plugin/executeFactory');
const moduleExecuteFactory = require('./module/executeFactory');
const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const Server = require('./server/server');
const ExposedMediator = require('./events/exposedMediator');
const Names = require('./nameSingleton');
const Router = require('./router/router');
const Validator = require('./misc/validator');
const deepcopy = require('deepcopy');

// TODO: make the execution factories be per module or plugin.

module.exports = function _asServer(config) {
    const names = Names.create();
    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const exposedMediator = new ExposedMediator();
    const moduleTree = new ModuleTree(config, rootCompiler, sharedCompiler, exposedMediator);
    const pluginTree = new PluginTree(config, rootCompiler, sharedCompiler, exposedMediator);

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    const moduleInterface = {
        add(mdl) {
            Validator.validateModule(mdl, Router);

            const immutableModule = deepcopy(mdl);

            if (names.has(immutableModule.name)) {
                throw new Error(`Module definition error. Module with name '${immutableModule.name}' already exists`);
            }

            names.add(immutableModule.name);

            moduleTree.addModule(immutableModule);
        },
        override: moduleTree.overrideModule,
        get: moduleTree.getModule,
        has: moduleTree.hasModule,
        getAll: moduleTree.getModules,
        remove: moduleTree.removeModule,
    };

    const pluginInterface = {
        add(plugin) {
            Validator.validatePlugin(plugin, Router);

            const immutablePlugin = deepcopy(plugin);

            if (names.has(immutablePlugin.name)) {
                throw new Error(`Plugin definition error. Plugin with name '${immutablePlugin.name}' already exists`);
            }

            const valid = names.addAndReplacePluginNames(immutablePlugin);

            if (valid !== true) {
                throw new Error(`Plugin definition error. Plugin module with name '${valid}' already exists`);
            }

            pluginTree.addPlugin(immutablePlugin);
        },
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
            const events = config.events;

            // TODO: make the executionFactory argument be available here in the future and test it
            pluginInterface.run = pluginTree.runTree.bind(pluginTree);
            moduleInterface.run = moduleTree.runTree.bind(moduleTree);

            const server = new Server(
                config,
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
