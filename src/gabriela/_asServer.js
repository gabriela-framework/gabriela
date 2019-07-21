"use strict";

const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const configFactory = require('./configFactory');
const Server = require('./server/server');
const Validator = require('./misc/validator');
const ExposedMediator = require('./events/exposedMediator');

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

    async function runModule(name, executeFactory) {
        if (name) return await moduleTree.runModule(name, executeFactory);

        return moduleTree.runTree(executeFactory);
    }

    async function runPlugin(name, executeFactory) {
        if (name) return pluginTree.runPlugin(name, executeFactory);

        return pluginTree.runTree(executeFactory);
    }

    const moduleInterface = {
        add(mdl) {
            moduleTree.addModule(mdl);
        },
        override: moduleTree.overrideModule,
        get: moduleTree.getModule,
        has: moduleTree.hasModule,
        getAll: moduleTree.getModules,
        remove: moduleTree.removeModule,
        run: runModule,
    };

    const pluginInterface = {
        add: pluginTree.addPlugin,
        get: pluginTree.getPlugin,
        remove: pluginTree.removePlugin,
        getAll: pluginTree.getPlugins,
        has: pluginTree.hasPlugin,
        run: runPlugin,
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

        startApp() {
            const {events} = opts;

            // TODO: make the executionFactory argument be available here in the future and test it
            pluginInterface.run = pluginTree.runTree.bind(pluginTree);
            moduleInterface.run = moduleTree.runTree.bind(moduleTree);

            const server = new Server(
                config.config.server,
                events,
                rootCompiler,
                pluginInterface,
                moduleInterface,
            );

            server.run();
        }
    };

    return publicInterface;
};